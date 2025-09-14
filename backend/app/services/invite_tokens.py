import hmac
import hashlib
import secrets
import base64
from datetime import datetime, timedelta
from typing import Optional
import os

from ..models import InviteToken
from .. import store


def get_invite_token_secret() -> str:
    """Get the INVITE_TOKEN_SECRET from environment variables."""
    secret = os.getenv("INVITE_TOKEN_SECRET")
    if not secret:
        raise ValueError("INVITE_TOKEN_SECRET environment variable is required")
    return secret


def generate_token() -> str:
    """Generate a secure random token."""
    # Generate 32 random bytes and encode as base64url
    token_bytes = secrets.token_bytes(32)
    return base64.urlsafe_b64encode(token_bytes).decode('ascii').rstrip('=')


def hash_token(token: str) -> str:
    """Hash a token using HMAC-SHA256."""
    secret = get_invite_token_secret()
    return hmac.new(
        secret.encode('utf-8'),
        token.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()


def create_invite_token(
    expires_hours: int = 24,
    role: Optional[str] = None,
    email_hint: Optional[str] = None,
    created_by: Optional[str] = None
) -> tuple[str, InviteToken]:
    """Create a new invite token and return both the plain token and the stored record."""
    plain_token = generate_token()
    token_hash = hash_token(plain_token)
    
    expires_at = datetime.utcnow() + timedelta(hours=expires_hours)
    
    invite_token = InviteToken(
        token_hash=token_hash,
        email_hint=email_hint,
        role=role,
        created_by=created_by,
        expires_at=expires_at
    )
    
    stored_token = store.create_invite_token(invite_token)
    return plain_token, stored_token


def validate_token(token: str) -> tuple[bool, str, Optional[InviteToken]]:
    """Validate a token and return (is_valid, error_message, token_record)."""
    try:
        token_hash = hash_token(token)
    except ValueError as e:
        return False, "Invalid token secret configuration", None
    
    token_record = store.find_invite_token_by_hash(token_hash)
    
    if not token_record:
        return False, "Invalid token", None
    
    if token_record.revoked:
        return False, "Token has been revoked", token_record
    
    if token_record.used_at:
        return False, "Token has already been used", token_record
    
    if datetime.utcnow() > token_record.expires_at:
        return False, "Token has expired", token_record
    
    return True, "", token_record


def mark_token_used(token_record: InviteToken) -> None:
    """Mark a token as used."""
    store.mark_token_as_used(token_record.id)