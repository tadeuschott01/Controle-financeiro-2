# ============================================================
# CONTROLES API
# Análise Financeira + WhatsApp Cloud API
# ============================================================

import os
import json
import hmac
import hashlib
import secrets
import re
from datetime import datetime, timedelta, timezone
from urllib.parse import quote
import urllib.request
import urllib.error

from fastapi import FastAPI, Request, Response, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional


# ============================================================
# CONFIGURAÇÃO
# ============================================================

app = FastAPI(
    title="ControleS API",
    description="API financeira e integração com WhatsApp",
    version="3.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# VARIÁVEIS DE AMBIENTE
# ============================================================
#
# IMPORTANTE:
# Tokens reais NÃO devem ficar no GitHub.
#
# No Render criaremos:
#
# WHATSAPP_VERIFY_TOKEN
# WHATSAPP_ACCESS_TOKEN
# WHATSAPP_PHONE_NUMBER_ID
#
# ============================================================

WHATSAPP_VERIFY_TOKEN = os.getenv(
    "WHATSAPP_VERIFY_TOKEN",
    "controles_webhook_2026"
)

WHATSAPP_ACCESS_TOKEN = os.getenv(
    "WHATSAPP_ACCESS_TOKEN",
    ""
)

WHATSAPP_PHONE_NUMBER_ID = os.getenv(
    "WHATSAPP_PHONE_NUMBER_ID",
    ""
)

GRAPH_API_VERSION = os.getenv(
    "GRAPH_API_VERSION",
    "v23.0"
)


# Supabase: credenciais apenas no servidor (Render).
SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
WHATSAPP_APP_SECRET = os.getenv("WHATSAPP_APP_SECRET", "")
WHATSAPP_LINK_SECRET = os.getenv("WHATSAPP_LINK_SECRET", "")
# ID UUID da conta autorizada a testar. Sem ele, lançamentos ficam bloqueados.
WHATSAPP_TEST_USER_ID = os.getenv("WHATSAPP_TEST_USER_ID", "").strip()


def supabase_request(table, method="GET", query="", payload=None, prefer=None, bearer=None):
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError("Supabase não configurado no Render")
    url = f"{SUPABASE_URL}/rest/v1/{table}{('?' + query) if query else ''}"
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("apikey", SUPABASE_SERVICE_ROLE_KEY)
    req.add_header("Authorization", f"Bearer {bearer or SUPABASE_SERVICE_ROLE_KEY}")
    req.add_header("Content-Type", "application/json")
    if prefer:
        req.add_header("Prefer", prefer)
    with urllib.request.urlopen(req, timeout=12) as res:
        body = res.read().decode("utf-8")
        return json.loads(body) if body else None


def authenticated_user_id(authorization):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Entre na sua conta ControleS")
    token = authorization.split(" ", 1)[1].strip()
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(503, "Supabase não configurado")
    req = urllib.request.Request(f"{SUPABASE_URL}/auth/v1/user")
    req.add_header("apikey", SUPABASE_SERVICE_ROLE_KEY)
    req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req, timeout=12) as res:
            user = json.loads(res.read().decode("utf-8"))
        return user["id"]
    except (urllib.error.HTTPError, KeyError, ValueError):
        raise HTTPException(401, "Sessão inválida; faça login novamente")


def code_hash(code):
    return hmac.new(WHATSAPP_LINK_SECRET.encode(), code.encode(), hashlib.sha256).hexdigest()


@app.post("/whatsapp/link-code")
def create_whatsapp_link_code(authorization: Optional[str] = Header(None)):
    """Exige login Supabase; devolve código temporário para enviar no WhatsApp."""
    if not WHATSAPP_LINK_SECRET or not WHATSAPP_TEST_USER_ID:
        raise HTTPException(503, "Modo de teste não configurado")
    user_id = authenticated_user_id(authorization)
    if user_id != WHATSAPP_TEST_USER_ID:
        raise HTTPException(403, "Teste restrito à conta autorizada")
    code = f"{secrets.randbelow(1000000):06d}"
    expires = (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
    try:
        supabase_request("whatsapp_pair_codes", "POST", payload={
            "user_id": user_id, "code_hash": code_hash(code), "expires_at": expires
        }, prefer="return=minimal")
    except Exception:
        raise HTTPException(503, "Não foi possível criar código")
    return {"code": code, "expires_in_seconds": 600, "message": f"VINCULAR {code}"}


def try_link_number(number, text):
    match = re.fullmatch(r"\s*VINCULAR\s+(\d{6})\s*", text, flags=re.I)
    if not match:
        return None
    if not WHATSAPP_LINK_SECRET or not WHATSAPP_TEST_USER_ID:
        return "Vinculação indisponível no momento."
    now = datetime.now(timezone.utc).isoformat()
    q = "code_hash=eq." + quote(code_hash(match.group(1)), safe="") + "&used_at=is.null&expires_at=gt." + quote(now, safe="") + "&select=id,user_id&limit=1"
    codes = supabase_request("whatsapp_pair_codes", query=q) or []
    if not codes or codes[0]["user_id"] != WHATSAPP_TEST_USER_ID:
        return "Código inválido ou expirado. Gere outro no ControleS."
    code = codes[0]
    # Impede vincular um número que já pertence a outra conta.
    existing = supabase_request("whatsapp_links", query="phone=eq." + quote(number, safe="") + "&select=user_id") or []
    if existing and existing[0]["user_id"] != code["user_id"]:
        return "Este número já está vinculado a outra conta."
    # Impede um código reutilizado em concorrência: PATCH condicional e retorno.
    used = supabase_request("whatsapp_pair_codes", "PATCH", "id=eq." + quote(code["id"], safe="") + "&used_at=is.null&select=id", {"used_at": now}, "return=representation") or []
    if not used:
        return "Código já utilizado. Gere outro no ControleS."
    supabase_request("whatsapp_links", "POST", payload={"phone": number, "user_id": code["user_id"]}, prefer="resolution=merge-duplicates,return=minimal")
    return "✅ WhatsApp vinculado à sua conta ControleS!"


def parse_financial_message(text):
    # Aceita somente padrões claros; evita lançar valores ambíguos.
    match = re.fullmatch(r"\s*(gastei|paguei|recebi)\s+(?:r\$\s*)?(\d+(?:[.,]\d{1,2})?)\s+(?:no|na|com|de|do|da|em|por)?\s*(.{2,90})\s*", text, re.I)
    if not match:
        return None
    verb, raw, description = match.groups()
    amount = float(raw.replace(",", "."))
    if amount <= 0 or amount > 1000000:
        return None
    return {"type": "receita" if verb.lower() == "recebi" else "despesa", "amount": amount, "description": description.strip(), "category": "Outros", "date": datetime.now(timezone.utc).date().isoformat()}


def handle_linked_finances(number, text, message_id):
    linked = try_link_number(number, text)
    if linked is not None:
        return linked
    links = supabase_request("whatsapp_links", query="phone=eq." + quote(number, safe="") + "&select=user_id&limit=1") or []
    if not links:
        return "Para usar o WhatsApp, primeiro vincule sua conta pelo aplicativo ControleS."
    user_id = links[0]["user_id"]
    if not WHATSAPP_TEST_USER_ID or user_id != WHATSAPP_TEST_USER_ID:
        return "Este recurso está disponível apenas para testes autorizados."
    transaction = parse_financial_message(text)
    if not transaction:
        return "Envie, por exemplo: Gastei 50 no mercado ou Recebi 100 de um serviço."
    if not message_id:
        return "Não foi possível identificar esta mensagem. Tente novamente."
    # Idempotência: Meta pode reenviar o mesmo evento.
    try:
        supabase_request("whatsapp_processed_messages", "POST", payload={"message_id": message_id, "user_id": user_id}, prefer="return=minimal")
    except urllib.error.HTTPError as exc:
        if exc.code == 409:
            return None
        raise
    transaction["user_id"] = user_id
    try:
        supabase_request("transactions", "POST", payload=transaction, prefer="return=minimal")
    except Exception:
        # Permite reprocessar caso o lançamento falhe (evita marcar como processado antes de salvar).
        try:
            supabase_request("whatsapp_processed_messages", "DELETE", "message_id=eq." + quote(message_id, safe=""))
        except Exception:
            pass
        raise
    return f"✅ {('Receita' if transaction['type'] == 'receita' else 'Despesa')} de {dinheiro(transaction['amount'])} registrada: {transaction['description']}."


# ============================================================
# MODELOS
# ============================================================

class Transacao(BaseModel):
    type: str
    amount: float
    category: str = "Outros"


class AnaliseRequest(BaseModel):
    transactions: List[Transacao]


class MensagemWhatsApp(BaseModel):
    numero: str
    mensagem: str


# ============================================================
# FUNÇÕES AUXILIARES
# ============================================================

def dinheiro(valor: float) -> str:

    return f"R$ {valor:,.2f}".replace(
        ",", "X"
    ).replace(
        ".", ","
    ).replace(
        "X", "."
    )


# ============================================================
# MOTOR DE ANÁLISE FINANCEIRA
# ============================================================

def calcular_financas(transactions):

    receitas = 0.0
    despesas = 0.0

    categorias = {}

    quantidade_receitas = 0
    quantidade_despesas = 0

    # --------------------------------------------------------
    # ANALISAR TRANSAÇÕES
    # --------------------------------------------------------

    for transacao in transactions:

        tipo = transacao.type.lower().strip()

        valor = abs(float(transacao.amount))

        if tipo in [
            "income",
            "receita",
            "entrada"
        ]:

            receitas += valor
            quantidade_receitas += 1

        else:

            despesas += valor
            quantidade_despesas += 1

            categoria = (
                transacao.category.strip()
                if transacao.category
                else "Outros"
            )

            categorias[categoria] = (
                categorias.get(categoria, 0)
                + valor
            )

    # --------------------------------------------------------
    # SALDO
    # --------------------------------------------------------

    saldo = receitas - despesas


    # --------------------------------------------------------
    # MAIOR CATEGORIA
    # --------------------------------------------------------

    maior_categoria = None
    maior_categoria_valor = 0.0

    if categorias:

        maior_categoria = max(
            categorias,
            key=categorias.get
        )

        maior_categoria_valor = categorias[
            maior_categoria
        ]


    # --------------------------------------------------------
    # PERCENTUAIS
    # --------------------------------------------------------

    percentual_gasto = 0.0
    taxa_economia = 0.0

    if receitas > 0:

        percentual_gasto = (
            despesas / receitas
        ) * 100

        taxa_economia = (
            saldo / receitas
        ) * 100


    percentual_maior_categoria = 0.0

    if despesas > 0:

        percentual_maior_categoria = (
            maior_categoria_valor / despesas
        ) * 100


    # --------------------------------------------------------
    # SITUAÇÃO FINANCEIRA
    # --------------------------------------------------------

    if receitas <= 0 and despesas > 0:

        situacao = "Sem receitas registradas"

    elif saldo < 0:

        situacao = "Saldo negativo"

    elif percentual_gasto > 90:

        situacao = "Atenção aos gastos"

    elif percentual_gasto > 70:

        situacao = "Gastos elevados"

    elif percentual_gasto > 50:

        situacao = "Gastos moderados"

    else:

        situacao = "Saldo confortável"


    # --------------------------------------------------------
    # ANÁLISE
    # --------------------------------------------------------

    analises = []

    if receitas > 0:

        analises.append(
            f"Você recebeu {dinheiro(receitas)} "
            f"e gastou {dinheiro(despesas)}."
        )

        analises.append(
            f"Suas despesas representam "
            f"{percentual_gasto:.1f}% "
            f"das suas receitas."
        )

    elif despesas > 0:

        analises.append(
            "Existem despesas registradas, "
            "mas nenhuma receita foi encontrada."
        )

    else:

        analises.append(
            "Ainda não existem movimentações suficientes "
            "para uma análise financeira."
        )


    if saldo > 0:

        analises.append(
            f"Seu saldo está positivo em "
            f"{dinheiro(saldo)}."
        )

    elif saldo < 0:

        analises.append(
            f"Suas despesas ultrapassaram suas receitas "
            f"em {dinheiro(abs(saldo))}."
        )

    else:

        analises.append(
            "Suas receitas e despesas estão "
            "no mesmo valor."
        )


    if maior_categoria:

        analises.append(
            f"A categoria com maior gasto foi "
            f"{maior_categoria}, com "
            f"{dinheiro(maior_categoria_valor)}, "
            f"representando "
            f"{percentual_maior_categoria:.1f}% "
            f"das despesas."
        )


    # --------------------------------------------------------
    # INSIGHTS
    # --------------------------------------------------------

    insights = []

    if percentual_gasto > 90:

        insights.append(
            "Quase toda a receita registrada "
            "está comprometida com despesas."
        )

    elif percentual_gasto > 70:

        insights.append(
            "Uma parcela elevada da receita "
            "está sendo utilizada em despesas."
        )

    elif receitas > 0 and percentual_gasto <= 50:

        insights.append(
            "Menos da metade da receita registrada "
            "foi utilizada em despesas."
        )


    if saldo > 0:

        insights.append(
            f"A diferença positiva entre receitas "
            f"e despesas é de {dinheiro(saldo)}."
        )


    if maior_categoria and despesas > 0:

        insights.append(
            f"{maior_categoria} concentra "
            f"{percentual_maior_categoria:.1f}% "
            f"dos gastos registrados."
        )


    # --------------------------------------------------------
    # RESULTADO
    # --------------------------------------------------------

    return {

        "receitas": round(receitas, 2),

        "despesas": round(despesas, 2),

        "saldo": round(saldo, 2),

        "maior_categoria": maior_categoria,

        "maior_categoria_valor":
            round(maior_categoria_valor, 2),

        "quantidade_transacoes":
            len(transactions),

        "quantidade_receitas":
            quantidade_receitas,

        "quantidade_despesas":
            quantidade_despesas,

        "percentual_gasto":
            round(percentual_gasto, 1),

        "taxa_economia":
            round(taxa_economia, 1),

        "percentual_maior_categoria":
            round(percentual_maior_categoria, 1),

        "situacao":
            situacao,

        "analise":
            " ".join(analises),

        "insights":
            insights,

        "categorias": {
            categoria: round(valor, 2)
            for categoria, valor
            in categorias.items()
        }
    }


# ============================================================
# ROTA PRINCIPAL
# ============================================================

@app.get("/")
def inicio():

    return {

        "status": "online",

        "app": "ControleS",

        "versao": "3.0.0",

        "servicos": {
            "analise_financeira": "online",
            "whatsapp": "online"
        },

        "mensagem":
            "ControleS API funcionando."
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "ok"
    }


# ============================================================
# API DE ANÁLISE FINANCEIRA
# ============================================================

@app.post("/analisar")
def analisar_financas(
    dados: AnaliseRequest
):

    return calcular_financas(
        dados.transactions
    )


# ============================================================
# WHATSAPP - STATUS
# ============================================================

@app.get("/whatsapp/status")
def whatsapp_status():

    configurado = bool(
        WHATSAPP_ACCESS_TOKEN
        and WHATSAPP_PHONE_NUMBER_ID
    )

    return {

        "status": "online",

        "servico":
            "WhatsApp ControleS",

        "webhook":
            "/webhook",

        "envio_configurado":
            configurado
    }


# ============================================================
# WHATSAPP - VERIFICAÇÃO DO WEBHOOK
# ============================================================

@app.get("/webhook")
async def verificar_webhook(
    request: Request
):

    mode = request.query_params.get(
        "hub.mode"
    )

    token = request.query_params.get(
        "hub.verify_token"
    )

    challenge = request.query_params.get(
        "hub.challenge"
    )


    if (
        mode == "subscribe"
        and token == WHATSAPP_VERIFY_TOKEN
        and challenge
    ):

        print(
            "Webhook do ControleS verificado pela Meta."
        )

        return Response(
            content=challenge,
            media_type="text/plain",
            status_code=200
        )


    print(
        "Falha na verificação do webhook."
    )

    return Response(
        content="Token de verificação inválido.",
        status_code=403
    )


# ============================================================
# ENVIAR MENSAGEM PELO WHATSAPP
# ============================================================

def enviar_mensagem_whatsapp(
    numero: str,
    mensagem: str
):

    if not WHATSAPP_ACCESS_TOKEN:

        print(
            "WHATSAPP_ACCESS_TOKEN não configurado."
        )

        return False


    if not WHATSAPP_PHONE_NUMBER_ID:

        print(
            "WHATSAPP_PHONE_NUMBER_ID não configurado."
        )

        return False


    url = (
        f"https://graph.facebook.com/"
        f"{GRAPH_API_VERSION}/"
        f"{WHATSAPP_PHONE_NUMBER_ID}/messages"
    )


    payload = {

        "messaging_product":
            "whatsapp",

        "recipient_type":
            "individual",

        "to":
            numero,

        "type":
            "text",

        "text": {
            "preview_url": False,
            "body": mensagem
        }
    }


    dados = json.dumps(
        payload
    ).encode(
        "utf-8"
    )


    requisicao = urllib.request.Request(
        url,
        data=dados,
        method="POST"
    )


    requisicao.add_header(
        "Authorization",
        f"Bearer {WHATSAPP_ACCESS_TOKEN}"
    )

    requisicao.add_header(
        "Content-Type",
        "application/json"
    )


    try:

        with urllib.request.urlopen(
            requisicao,
            timeout=15
        ) as resposta:

            resultado = resposta.read().decode(
                "utf-8"
            )

            print(
                "Mensagem enviada:",
                resultado
            )

            return True


    except urllib.error.HTTPError as erro:

        detalhe = erro.read().decode(
            "utf-8",
            errors="ignore"
        )

        print(
            "Erro da API do WhatsApp:",
            erro.code,
            detalhe
        )

        return False


    except Exception as erro:

        print(
            "Erro ao enviar mensagem:",
            erro
        )

        return False


# ============================================================
# RESPOSTA BÁSICA DO CONTROLES
# ============================================================

def gerar_resposta_whatsapp(
    texto: str
):

    mensagem = texto.lower().strip()


    if mensagem in [
        "oi",
        "olá",
        "ola",
        "bom dia",
        "boa tarde",
        "boa noite"
    ]:

        return (
            "Olá! 👋 Eu sou o assistente do ControleS.\n\n"
            "Você pode consultar suas informações "
            "financeiras pelo WhatsApp."
        )


    if (
        "saldo" in mensagem
        or "gastei" in mensagem
        or "gastos" in mensagem
        or "despesas" in mensagem
        or "recebi" in mensagem
        or "receita" in mensagem
    ):

        return (
            "Entendi sua consulta financeira. "
            "A conexão com os dados da sua conta "
            "ControleS será a próxima etapa da configuração."
        )


    return (
        "Olá! Sou o assistente do ControleS. 👋\n\n"
        "Posso ajudar com informações sobre "
        "receitas, despesas, saldo e gastos."
    )


# ============================================================
# WHATSAPP - RECEBER MENSAGENS
# ============================================================

@app.post("/webhook")
async def receber_webhook(request: Request):
    if not WHATSAPP_APP_SECRET:
        raise HTTPException(503, "WHATSAPP_APP_SECRET não configurado")
    body = await request.body()
    signature = request.headers.get("X-Hub-Signature-256", "")
    expected = "sha256=" + hmac.new(WHATSAPP_APP_SECRET.encode(), body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected):
        raise HTTPException(403, "Assinatura Meta inválida")
    try:
        payload = json.loads(body)
    except ValueError:
        raise HTTPException(400, "JSON inválido")
    for entry in payload.get("entry", []):
        for change in entry.get("changes", []):
            for message in change.get("value", {}).get("messages", []):
                if message.get("type") != "text":
                    continue
                number = message.get("from")
                text = message.get("text", {}).get("body", "")
                if not number or not text:
                    continue
                try:
                    response = handle_linked_finances(number, text, message.get("id"))
                    if response:
                        enviar_mensagem_whatsapp(number, response)
                except Exception as exc:
                    print("Falha ao processar mensagem WhatsApp:", type(exc).__name__)
                    # Erros transitórios devem resultar em reenvio do evento pela Meta.
                    raise HTTPException(503, "Erro temporário no processamento")
    return {"status": "ok"}


# A rota /whatsapp/enviar foi desativada por não exigir autenticação.
