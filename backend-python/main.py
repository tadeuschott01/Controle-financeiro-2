from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def inicio():
    return {
        "status": "online",
        "app": "ControleS",
        "mensagem": "Backend Python funcionando!"
    }
