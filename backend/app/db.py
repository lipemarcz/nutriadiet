from __future__ import annotations

import os
import sqlite3
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple
from datetime import datetime
import uuid

from pydantic import BaseModel


DB_PATH = os.getenv("APP_DB_PATH", str(Path(__file__).resolve().parent / "app.db"))


def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = _get_conn()
    cur = conn.cursor()

    # usuarios table
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS usuarios (
            id TEXT PRIMARY KEY,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha_hash TEXT NOT NULL,
            papel TEXT NOT NULL CHECK(papel IN ('master','colaborador')),
            criado_em TEXT NOT NULL
        )
        """
    )

    # tokens_convite table
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS tokens_convite (
            id TEXT PRIMARY KEY,
            token TEXT NOT NULL,
            usado INTEGER NOT NULL DEFAULT 0,
            criado_por TEXT NOT NULL,
            criado_em TEXT NOT NULL,
            usado_em TEXT,
            FOREIGN KEY(criado_por) REFERENCES usuarios(id)
        )
        """
    )

    conn.commit()
    conn.close()


def _now_iso() -> str:
    return datetime.utcnow().isoformat(timespec="seconds") + "Z"


def get_usuario_by_email(email: str) -> Optional[sqlite3.Row]:
    conn = _get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM usuarios WHERE email = ?", (email.lower(),))
    row = cur.fetchone()
    conn.close()
    return row


def get_usuario_by_id(user_id: str) -> Optional[sqlite3.Row]:
    conn = _get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM usuarios WHERE id = ?", (user_id,))
    row = cur.fetchone()
    conn.close()
    return row


def create_usuario(nome: str, email: str, senha_hash: str, papel: str) -> str:
    user_id = str(uuid.uuid4())
    conn = _get_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO usuarios (id, nome, email, senha_hash, papel, criado_em) VALUES (?, ?, ?, ?, ?, ?)",
        (user_id, nome, email.lower(), senha_hash, papel, _now_iso()),
    )
    conn.commit()
    conn.close()
    return user_id


def ensure_master(email: Optional[str], senha_hash: Optional[str]) -> Optional[str]:
    """Ensure a master user exists. Returns the user_id if created or found, else None."""
    if not email or not senha_hash:
        # Missing config; do not block app
        return None
    existing = get_usuario_by_email(email.lower())
    if existing:
        return existing["id"]
    return create_usuario(nome="Administrador", email=email.lower(), senha_hash=senha_hash, papel="master")


def insert_token(criado_por: str) -> Tuple[str, str]:
    token_id = str(uuid.uuid4())
    token_plain = str(uuid.uuid4())
    conn = _get_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO tokens_convite (id, token, criado_por, criado_em, usado) VALUES (?, ?, ?, ?, 0)",
        (token_id, token_plain, criado_por, _now_iso()),
    )
    conn.commit()
    conn.close()
    return token_id, token_plain


def mark_token_used(token_id: str) -> None:
    conn = _get_conn()
    cur = conn.cursor()
    cur.execute(
        "UPDATE tokens_convite SET usado = 1, usado_em = ? WHERE id = ?",
        (_now_iso(), token_id),
    )
    conn.commit()
    conn.close()


def get_token_record_by_token(token: str) -> Optional[sqlite3.Row]:
    conn = _get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tokens_convite WHERE token = ?", (token,))
    row = cur.fetchone()
    conn.close()
    return row


def list_tokens(limit: int = 20) -> List[Dict[str, Any]]:
    conn = _get_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, token, usado, criado_por, criado_em, usado_em FROM tokens_convite ORDER BY criado_em DESC LIMIT ?",
        (limit,),
    )
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


