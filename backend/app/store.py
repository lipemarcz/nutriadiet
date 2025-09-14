from __future__ import annotations

import os
import time
import threading
from typing import Dict, List, Optional

try:
    import bcrypt  # type: ignore
except Exception:  # pragma: no cover - bcrypt may not be installed in CI
    bcrypt = None  # type: ignore

from .models import StoredUser, PublicUser, InviteToken


_users_lock = threading.RLock()
_users: Dict[str, StoredUser] = {}

_tokens_lock = threading.RLock()
_invite_tokens: Dict[str, InviteToken] = {}


def _now_iso() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def list_users() -> List[PublicUser]:
    with _users_lock:
        return [to_public_user(u) for u in _users.values()]


def find_by_username(username: str) -> Optional[StoredUser]:
    with _users_lock:
        for u in _users.values():
            if u.username.lower() == username.lower():
                return u
    return None


def find_by_id(user_id: str) -> Optional[StoredUser]:
    with _users_lock:
        return _users.get(user_id)


def find_by_email(email: str) -> Optional[StoredUser]:
    with _users_lock:
        for u in _users.values():
            if u.email and u.email.lower() == email.lower():
                return u
    return None


def _random_id() -> str:
    # Simple ID for demo purposes
    return hex(int(time.time() * 1000000))[2:]  # pragma: no cover


def to_public_user(u: StoredUser) -> PublicUser:
    return PublicUser(
        id=u.id,
        username=u.username,
        email=u.email,
        name=u.name,
        profession=u.profession,
        photo_data_url=u.photo_data_url,
        is_admin=u.is_admin,
        created_at=u.created_at,
        updated_at=u.updated_at,
    )


def create_user_with_hash(
    *,
    username: str,
    name: str,
    password_hash: str,
    email: Optional[str] = None,
    is_admin: bool = False,
) -> PublicUser:
    if find_by_username(username):
        raise ValueError("User already exists")
    now = _now_iso()
    user = StoredUser(
        id=_random_id(),
        username=username,
        email=email,
        name=name,
        profession="",
        photo_data_url=None,
        is_admin=is_admin,
        password_hash=password_hash,
        created_at=now,
        updated_at=now,
    )
    with _users_lock:
        _users[user.id] = user
    return to_public_user(user)


def create_user(*, username: str, name: str, password: str, email: Optional[str] = None) -> PublicUser:
    if bcrypt is None:
        raise RuntimeError("bcrypt is required on the backend to create users")
    pw_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    return create_user_with_hash(username=username, name=name, password_hash=pw_hash, email=email, is_admin=False)


def update_user(
    *,
    user_id: str,
    name: Optional[str] = None,
    profession: Optional[str] = None,
    photo_data_url: Optional[str] = None,
) -> PublicUser:
    with _users_lock:
        u = _users.get(user_id)
        if not u:
            raise KeyError("User not found")
        if name is not None:
            u.name = name
        if profession is not None:
            u.profession = profession
        if photo_data_url is not None:
            u.photo_data_url = photo_data_url
        u.updated_at = _now_iso()
        _users[user_id] = u
        return to_public_user(u)


def reset_password(*, user_id: str, new_password: str) -> None:
    if bcrypt is None:
        raise RuntimeError("bcrypt is required on the backend to reset passwords")
    with _users_lock:
        u = _users.get(user_id)
        if not u:
            raise KeyError("User not found")
        u.password_hash = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        u.updated_at = _now_iso()
        _users[user_id] = u


# Legacy admin seeding removed - use invite tokens to create admin users


# Invite token management
def create_invite_token(token: InviteToken) -> InviteToken:
    with _tokens_lock:
        _invite_tokens[token.id] = token
    return token


def find_invite_token_by_hash(token_hash: str) -> Optional[InviteToken]:
    with _tokens_lock:
        for token in _invite_tokens.values():
            if token.token_hash == token_hash:
                return token
    return None


def mark_token_as_used(token_id: str) -> None:
    from datetime import datetime
    with _tokens_lock:
        token = _invite_tokens.get(token_id)
        if token:
            token.used_at = datetime.utcnow()
            _invite_tokens[token_id] = token


def list_invite_tokens() -> List[InviteToken]:
    with _tokens_lock:
        return list(_invite_tokens.values())
