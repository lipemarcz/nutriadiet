from __future__ import annotations

import os
import bcrypt
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, EmailStr
from typing import Optional
import time

from .db import (
    init_db,
    ensure_master,
    get_usuario_by_email,
    get_usuario_by_id,
    create_usuario,
    insert_token,
    mark_token_used,
    get_token_record_by_token,
    list_tokens,
)
from .security import issue_jwt, verify_jwt


router = APIRouter()


# ===== Models =====

class EntrarRequest(BaseModel):
    email: EmailStr
    senha: str


class CadastroRequest(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    token: str


def _cookie_settings() -> dict:
    secure = os.getenv("COOKIE_SECURE", "true").lower() != "false"
    return dict(httponly=True, samesite="lax", secure=secure, max_age=60 * 60 * 12)


# ===== Middleware helpers =====

def require_auth(request: Request) -> dict:
    token = request.cookies.get("auth_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="É necessário entrar para acessar esta página.")
    payload = verify_jwt(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="É necessário entrar para acessar esta página.")
    return payload


def require_master(payload: dict = Depends(require_auth)) -> dict:
    if payload.get("role") != "master":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso permitido apenas para administrador.")
    return payload


# ===== Startup: init DB and seed master =====

def setup_startup_seed() -> None:
    init_db()
    master_email = os.getenv("MASTER_EMAIL")
    master_senha = os.getenv("MASTER_SENHA")
    if master_email and master_senha:
        senha_hash = bcrypt.hashpw(master_senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        ensure_master(master_email.lower(), senha_hash)


# ===== Endpoints =====

# Simple in-memory rate limit for login: 5 per minute por IP
_login_buckets: dict[str, list[float]] = {}
_LOGIN_LIMIT = 5

def _rate_limit_login(request: Request) -> None:
    ip = request.client.host if request.client else "unknown"
    now = time.time()
    bucket = _login_buckets.setdefault(ip, [])
    window_start = now - 60
    # prune
    while bucket and bucket[0] < window_start:
        bucket.pop(0)
    if len(bucket) >= _LOGIN_LIMIT:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Muitas tentativas. Tente novamente em instantes.")
    bucket.append(now)

@router.post("/api/entrar")
def api_entrar(payload: EntrarRequest, response: Response, request: Request):
    _rate_limit_login(request)
    user = get_usuario_by_email(payload.email.lower())
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="E-mail ou senha incorretos.")
    if not bcrypt.checkpw(payload.senha.encode("utf-8"), user["senha_hash"].encode("utf-8")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="E-mail ou senha incorretos.")

    jwt_token = issue_jwt(user_id=user["id"], role=user["papel"])  # type: ignore
    response.set_cookie("auth_token", jwt_token, **_cookie_settings())
    return {"ok": True, "papel": user["papel"]}


@router.post("/api/sair")
def api_sair(response: Response):
    response.delete_cookie("auth_token")
    return {"ok": True}


@router.post("/api/cadastro", status_code=201)
def api_cadastro(payload: CadastroRequest):
    # valida token
    token_row = get_token_record_by_token(payload.token)
    if not token_row or token_row["usado"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token inválido ou já utilizado.")

    # valida email único e senha mínima
    if len(payload.senha) < 6:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Senha deve ter no mínimo 6 caracteres.")
    if get_usuario_by_email(payload.email.lower()):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="E-mail já cadastrado.")

    senha_hash = bcrypt.hashpw(payload.senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    create_usuario(nome=payload.nome, email=payload.email.lower(), senha_hash=senha_hash, papel="colaborador")
    mark_token_used(token_row["id"])  # single-use
    return {"ok": True}


@router.post("/api/gerar-token")
def api_gerar_token(_: dict = Depends(require_master)):
    master_payload = _
    token_id, token_plain = insert_token(master_payload["sub"])  # criado_por = master id
    return {"token": token_plain}


@router.get("/api/tokens")
def api_tokens(_: dict = Depends(require_master)):
    return {"items": list_tokens(limit=20)}


@router.get("/api/me")
def api_me(payload: dict = Depends(require_auth)):
    user = get_usuario_by_id(payload.get("sub"))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="É necessário entrar para acessar esta página.")
    return {
        "id": user["id"],
        "nome": user["nome"],
        "email": user["email"],
        "papel": user["papel"],
    }


