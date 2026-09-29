# ============================================================
# CONTROLES API
# Análise Financeira + WhatsApp Cloud API
# ============================================================

import os
import json
import urllib.request
import urllib.error

from fastapi import FastAPI, Request, Response, HTTPException
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
async def receber_webhook(
    request: Request
):

    try:

        dados = await request.json()

        print(
            "========================================"
        )

        print(
            "EVENTO RECEBIDO DO WHATSAPP"
        )

        print(
            "========================================"
        )

        print(
            json.dumps(
                dados,
                ensure_ascii=False
            )
        )


        # ----------------------------------------------------
        # ENTRY
        # ----------------------------------------------------

        entries = dados.get(
            "entry",
            []
        )


        for entry in entries:

            changes = entry.get(
                "changes",
                []
            )


            for change in changes:

                value = change.get(
                    "value",
                    {}
                )


                messages = value.get(
                    "messages",
                    []
                )


                for mensagem in messages:

                    numero_usuario = mensagem.get(
                        "from"
                    )

                    tipo_mensagem = mensagem.get(
                        "type"
                    )


                    # ----------------------------------------
                    # SOMENTE TEXTO POR ENQUANTO
                    # ----------------------------------------

                    if tipo_mensagem != "text":

                        continue


                    texto = mensagem.get(
                        "text",
                        {}
                    ).get(
                        "body",
                        ""
                    )


                    print(
                        "Número:",
                        numero_usuario
                    )

                    print(
                        "Mensagem:",
                        texto
                    )


                    if (
                        numero_usuario
                        and texto
                    ):

                        resposta = gerar_resposta_whatsapp(
                            texto
                        )

                        enviar_mensagem_whatsapp(
                            numero_usuario,
                            resposta
                        )


        # A Meta espera HTTP 200 rapidamente.
        return {
            "status": "ok"
        }


    except Exception as erro:

        print(
            "Erro ao processar webhook:",
            erro
        )

        # Mantemos resposta controlada para evitar
        # reenvios desnecessários durante os testes.
        return {
            "status": "ok"
        }


# ============================================================
# ROTA MANUAL PARA TESTAR ENVIO
# ============================================================

@app.post("/whatsapp/enviar")
def enviar_whatsapp(
    dados: MensagemWhatsApp
):

    enviado = enviar_mensagem_whatsapp(
        dados.numero,
        dados.mensagem
    )


    if not enviado:

        raise HTTPException(
            status_code=500,
            detail=(
                "Não foi possível enviar a mensagem. "
                "Confira as variáveis do WhatsApp no Render."
            )
        )


    return {
        "status": "enviado",
        "numero": dados.numero
    }
