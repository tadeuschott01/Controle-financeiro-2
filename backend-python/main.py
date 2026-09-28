import os

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List


# =========================================================
# CONTROLES API
# =========================================================

app = FastAPI(
    title="ControleS API",
    version="2.1.0"
)


# =========================================================
# CORS
# =========================================================

# Permite que o app ControleS converse com esta API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# MODELOS
# =========================================================

class Transacao(BaseModel):
    type: str
    amount: float
    category: str = "Outros"


class AnaliseRequest(BaseModel):
    transactions: List[Transacao]


# =========================================================
# FUNÇÕES AUXILIARES
# =========================================================

def dinheiro(valor):
    return f"R$ {valor:,.2f}".replace(
        ",", "X"
    ).replace(
        ".", ","
    ).replace(
        "X", "."
    )


# =========================================================
# ROTA PRINCIPAL
# =========================================================

@app.get("/")
def inicio():
    return {
        "status": "online",
        "app": "ControleS",
        "versao": "2.1.0",
        "mensagem": "Motor financeiro Python funcionando!"
    }


# =========================================================
# ANÁLISE FINANCEIRA
# =========================================================

@app.post("/analisar")
def analisar_financas(dados: AnaliseRequest):

    receitas = 0.0
    despesas = 0.0

    categorias = {}

    quantidade_receitas = 0
    quantidade_despesas = 0

    # -----------------------------------------------------
    # ANALISAR TRANSAÇÕES
    # -----------------------------------------------------

    for transacao in dados.transactions:

        tipo = transacao.type.lower().strip()

        # Evita valores negativos atrapalhando
        # os cálculos financeiros
        valor = abs(transacao.amount)

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

    # -----------------------------------------------------
    # SALDO
    # -----------------------------------------------------

    saldo = receitas - despesas

    # -----------------------------------------------------
    # MAIOR CATEGORIA DE GASTOS
    # -----------------------------------------------------

    maior_categoria = None
    maior_categoria_valor = 0.0

    if categorias:

        maior_categoria = max(
            categorias,
            key=categorias.get
        )

        maior_categoria_valor = (
            categorias[maior_categoria]
        )

    # -----------------------------------------------------
    # PERCENTUAL DA RENDA GASTO
    # -----------------------------------------------------

    if receitas > 0:

        percentual_gasto = (
            despesas / receitas
        ) * 100

        taxa_economia = (
            saldo / receitas
        ) * 100

    else:

        percentual_gasto = 0
        taxa_economia = 0

    # -----------------------------------------------------
    # PESO DA MAIOR CATEGORIA
    # -----------------------------------------------------

    if despesas > 0:

        percentual_maior_categoria = (
            maior_categoria_valor
            / despesas
        ) * 100

    else:

        percentual_maior_categoria = 0

    # -----------------------------------------------------
    # SITUAÇÃO FINANCEIRA
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # ANÁLISE AUTOMÁTICA
    # -----------------------------------------------------

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
            "Ainda não existem movimentações "
            "suficientes para uma análise financeira."
        )

    if saldo > 0:

        analises.append(
            f"Seu saldo está positivo em "
            f"{dinheiro(saldo)}."
        )

    elif saldo < 0:

        analises.append(
            f"Suas despesas ultrapassaram "
            f"as receitas em "
            f"{dinheiro(abs(saldo))}."
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

    # -----------------------------------------------------
    # INSIGHTS
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # RESPOSTA DA API
    # -----------------------------------------------------

    return {

        # Mantidos para não quebrar o app atual
        "receitas": round(receitas, 2),
        "despesas": round(despesas, 2),
        "saldo": round(saldo, 2),

        "maior_categoria": maior_categoria,

        "maior_categoria_valor":
            round(maior_categoria_valor, 2),

        "quantidade_transacoes":
            len(dados.transactions),

        "quantidade_receitas":
            quantidade_receitas,

        "quantidade_despesas":
            quantidade_despesas,

        "percentual_gasto":
            round(percentual_gasto, 1),

        "taxa_economia":
            round(taxa_economia, 1),

        "percentual_maior_categoria":
            round(
                percentual_maior_categoria,
                1
            ),

        "situacao":
            situacao,

        "analise":
            " ".join(analises),

        "insights":
            insights,

        "categorias":
            {
                categoria: round(valor, 2)
                for categoria, valor
                in categorias.items()
            }
    }


# =========================================================
# WHATSAPP
# =========================================================

# Esse token será usado pela Meta para verificar
# se o webhook realmente pertence ao ControleS.
#
# Quando hospedarmos o backend, criaremos a variável:
#
# WHATSAPP_VERIFY_TOKEN
#
# Evite colocar tokens reais da Meta diretamente
# dentro do código do GitHub.

VERIFY_TOKEN = os.getenv(
    "WHATSAPP_VERIFY_TOKEN",
    "controles_webhook_2026"
)


# =========================================================
# VERIFICAÇÃO DO WEBHOOK
# =========================================================

@app.get("/webhook")
async def verificar_webhook(request: Request):

    mode = request.query_params.get(
        "hub.mode"
    )

    token = request.query_params.get(
        "hub.verify_token"
    )

    challenge = request.query_params.get(
        "hub.challenge"
    )

    # A Meta envia esses dados quando clicamos
    # em "Verificar e salvar".
    if (
        mode == "subscribe"
        and token == VERIFY_TOKEN
        and challenge
    ):

        print(
            "Webhook do WhatsApp verificado."
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
        content="Token de verificação inválido",
        status_code=403
    )


# =========================================================
# RECEBER MENSAGENS DO WHATSAPP
# =========================================================

@app.post("/webhook")
async def receber_webhook(request: Request):

    try:

        dados = await request.json()

        print(
            "===================================="
        )

        print(
            "EVENTO RECEBIDO DO WHATSAPP"
        )

        print(
            "===================================="
        )

        print(dados)

        # -------------------------------------------------
        # TENTAR IDENTIFICAR UMA MENSAGEM RECEBIDA
        # -------------------------------------------------

        try:

            entry = dados.get(
                "entry",
                []
            )

            if entry:

                changes = entry[0].get(
                    "changes",
                    []
                )

                if changes:

                    value = changes[0].get(
                        "value",
                        {}
                    )

                    messages = value.get(
                        "messages",
                        []
                    )

                    if messages:

                        mensagem = messages[0]

                        numero_usuario = mensagem.get(
                            "from"
                        )

                        tipo_mensagem = mensagem.get(
                            "type"
                        )

                        texto = ""

                        if tipo_mensagem == "text":

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
                            "Tipo:",
                            tipo_mensagem
                        )

                        print(
                            "Mensagem:",
                            texto
                        )

        except Exception as erro_mensagem:

            print(
                "Não foi possível interpretar "
                "a mensagem:",
                erro_mensagem
            )

        # A Meta precisa receber HTTP 200
        # rapidamente para saber que recebemos
        # o evento.

        return {
            "status": "ok"
        }

    except Exception as erro:

        print(
            "Erro ao processar webhook:",
            erro
        )

        # Mesmo em caso de payload inesperado,
        # mantemos uma resposta controlada.

        return {
            "status": "erro",
            "mensagem": "Evento recebido"
        }


# =========================================================
# STATUS DO WHATSAPP
# =========================================================

@app.get("/whatsapp/status")
def whatsapp_status():

    return {
        "status": "online",
        "servico": "WhatsApp ControleS",
        "webhook": "/webhook"
    }
