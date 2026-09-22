from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="ControleS API")

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


@app.get("/")
def inicio():
    return {
        "status": "online",
        "app": "ControleS",
        "mensagem": "Backend Python funcionando!"
    }


@app.post("/analisar")
def analisar_financas(dados: AnaliseRequest):

    receitas = 0.0
    despesas = 0.0
    categorias = {}

    for transacao in dados.transactions:

        tipo = transacao.type.lower()
        valor = transacao.amount

        if tipo in ["income", "receita", "entrada"]:
            receitas += valor

        else:
            despesas += valor

            categoria = transacao.category or "Outros"

            categorias[categoria] = (
                categorias.get(categoria, 0) + valor
            )

    saldo = receitas - despesas

    maior_categoria = None
    maior_categoria_valor = 0.0

    if categorias:
        maior_categoria = max(
            categorias,
            key=categorias.get
        )

        maior_categoria_valor = categorias[maior_categoria]

    return {
        "receitas": round(receitas, 2),
        "despesas": round(despesas, 2),
        "saldo": round(saldo, 2),
        "maior_categoria": maior_categoria,
        "maior_categoria_valor": round(maior_categoria_valor, 2),
        "quantidade_transacoes": len(dados.transactions)
    }
