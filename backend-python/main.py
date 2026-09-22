from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(
    title="ControleS API",
    version="2.0.0"
)

# Permite que o app ControleS converse com esta API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Transacao(BaseModel):
    type: str
    amount: float
    category: str = "Outros"


class AnaliseRequest(BaseModel):
    transactions: List[Transacao]


def dinheiro(valor):
    return f"R$ {valor:,.2f}".replace(
        ",", "X"
    ).replace(
        ".", ","
    ).replace(
        "X", "."
    )


@app.get("/")
def inicio():
    return {
        "status": "online",
        "app": "ControleS",
        "versao": "2.0.0",
        "mensagem": "Motor financeiro Python funcionando!"
    }


@app.post("/analisar")
def analisar_financas(dados: AnaliseRequest):

    receitas = 0.0
    despesas = 0.0

    categorias = {}

    quantidade_receitas = 0
    quantidade_despesas = 0

    # ---------------------------------------------
    # ANALISAR TRANSAÇÕES
    # ---------------------------------------------

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

    # ---------------------------------------------
    # SALDO
    # ---------------------------------------------

    saldo = receitas - despesas

    # ---------------------------------------------
    # MAIOR CATEGORIA DE GASTOS
    # ---------------------------------------------

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

    # ---------------------------------------------
    # PERCENTUAL DA RENDA GASTO
    # ---------------------------------------------

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

    # ---------------------------------------------
    # PESO DA MAIOR CATEGORIA
    # ---------------------------------------------

    if despesas > 0:

        percentual_maior_categoria = (
            maior_categoria_valor
            / despesas
        ) * 100

    else:

        percentual_maior_categoria = 0

    # ---------------------------------------------
    # SITUAÇÃO FINANCEIRA
    # ---------------------------------------------

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

    # ---------------------------------------------
    # ANÁLISE AUTOMÁTICA
    # ---------------------------------------------

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

    # ---------------------------------------------
    # INSIGHTS
    # ---------------------------------------------

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

    # ---------------------------------------------
    # RESPOSTA DA API
    # ---------------------------------------------

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

        # Novos dados da versão 2
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
