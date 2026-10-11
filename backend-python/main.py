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
