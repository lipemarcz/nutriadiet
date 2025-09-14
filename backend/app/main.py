from __future__ import annotations

# Load environment from .env FIRST before any other imports
import os
try:  # optional dependency
    from dotenv import load_dotenv, find_dotenv  # type: ignore

    env_file = find_dotenv()
    print(f"DEBUG: Loading .env from: {env_file}")
    load_dotenv(env_file, override=False)
    print(f"DEBUG: INVITE_TOKEN_SECRET loaded: {'INVITE_TOKEN_SECRET' in os.environ}")
except Exception as e:
    print(f"DEBUG: Error loading .env: {e}")
    pass

import logging
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
from fastapi import FastAPI, Depends, HTTPException, Request, Response
from fastapi import status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import time
import secrets
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import bcrypt

try:
    import bcrypt
except ImportError:
    bcrypt = None  # type: ignore

try:
    from secrets import compare_digest
except ImportError:
    # Fallback for older Python versions
    def compare_digest(a, b):
        return a == b
    pass

from .models import CreateUserRequest, UpdateUserRequest, ResetPasswordRequest, RegisterWithTokenRequest, PublicUser
# Legacy admin security removed - use invite tokens instead
from . import store
from .invite_api import InviteTokenManager
from .invite_routes import router as invite_router
from .supabase_auth_routes import router as supabase_auth_router
from .pt_routes import router as pt_router
from .pt_routes import setup_startup_seed


logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializa DB e garante Conta Master caso .env forneça credenciais
    try:
        setup_startup_seed()
    except Exception as e:
        logger.error(f"Falha na inicialização/seed: {e}")
    yield


app = FastAPI(title="NUTRIA Backend", version="0.3.0", lifespan=lifespan)

# CORS (lock to provided origins; allow credentials)
origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
if origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )

# Include legacy/invite/supabase routes (mantidos se ainda em uso)
app.include_router(invite_router)
app.include_router(supabase_auth_router)

# Include Portuguese API routes
app.include_router(pt_router)


@app.get("/")
def health():
    return {"status": "ok"}


# Simple in-memory session store (demo)
_sessions: dict[str, dict] = {}
SESSION_COOKIE = "sid"
CSRF_COOKIE = "csrf"
SESSION_TTL = 60 * 60 * 4  # 4 hours


def _issue_session(resp: Response, user_id: str):
    sid = secrets.token_urlsafe(24)
    _sessions[sid] = {"uid": user_id, "exp": time.time() + SESSION_TTL}
    secure = os.getenv("COOKIE_SECURE", "true").lower() != "false"
    resp.set_cookie(SESSION_COOKIE, sid, httponly=True, secure=secure, samesite="lax", max_age=SESSION_TTL)
    # Double-submit CSRF token (not HttpOnly)
    csrf = secrets.token_urlsafe(16)
    resp.set_cookie(CSRF_COOKIE, csrf, httponly=False, secure=secure, samesite="lax", max_age=SESSION_TTL)


def _clear_session(resp: Response, request: Request):
    sid = request.cookies.get(SESSION_COOKIE)
    if sid and sid in _sessions:
        _sessions.pop(sid, None)
    resp.delete_cookie(SESSION_COOKIE)
    resp.delete_cookie(CSRF_COOKIE)


def _require_session(request: Request) -> str:
    sid = request.cookies.get(SESSION_COOKIE)
    if not sid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    sess = _sessions.get(sid)
    if not sess or sess.get("exp", 0) < time.time():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    return sess["uid"]


def _require_csrf(request: Request):
    # Double submit: header must match cookie
    header = request.headers.get("x-csrf-token")
    cookie = request.cookies.get(CSRF_COOKIE)
    if not header or not cookie or header != cookie:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CSRF validation failed")


# Legacy admin endpoints removed - use invite tokens to create admin users


# Cookie-based auth endpoints (legacy, kept for backward compatibility)
@app.post("/api/auth/login")
def api_login(payload: dict, response: Response):
    # payload: { usernameOrEmail, password }
    username_or_email = str(payload.get("usernameOrEmail", "")).strip()
    password = str(payload.get("password", ""))
    if not username_or_email or not password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials")

    # Find user
    users = store.list_users()
    target = None
    for pu in users:
        if pu.username.lower() == username_or_email.lower() or (pu.email and pu.email.lower() == username_or_email.lower()):
            target = store.find_by_username(pu.username)
            break
    if not target:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    try:
        import bcrypt  # type: ignore
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Server error")

    if not bcrypt.checkpw(password.encode("utf-8"), target.password_hash.encode("utf-8")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    _issue_session(response, target.id)
    return {"user": store.to_public_user(target)}


@app.post("/api/auth/logout")
def api_logout(request: Request, response: Response):
    _require_session(request)
    _require_csrf(request)
    _clear_session(response, request)
    return {"status": "ok"}


@app.get("/api/auth/me")
def api_me(request: Request):
    try:
        uid = _require_session(request)
    except HTTPException as e:
        if e.status_code == status.HTTP_401_UNAUTHORIZED:
            raise
        raise
    user = store.find_by_id(uid)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    return {"user": store.to_public_user(user)}


@app.get("/api/feature/secure-data")
def secure_data(request: Request):
    uid = _require_session(request)
    user = store.find_by_id(uid)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    if not (user.is_admin or True):  # Treat all non-guests as members in demo
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return {"data": "exclusive:42"}


# Legacy token-gated registration removed - use invite tokens instead
_register_rl: dict[str, list[float]] = {}
_REGISTER_LIMIT = int(os.getenv("REGISTER_RATE_LIMIT_PER_MIN", "5"))


def _rate_limit(request: Request):
    ip = request.client.host if request.client else "unknown"
    now = time.time()
    window_start = now - 60
    bucket = _register_rl.setdefault(ip, [])
    # prune
    while bucket and bucket[0] < window_start:
        bucket.pop(0)
    if len(bucket) >= _REGISTER_LIMIT:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many attempts")
    bucket.append(now)


def _validate_password(pw: str) -> bool:
    if len(pw) < 8:
        return False
    has_alpha = any(c.isalpha() for c in pw)
    has_digit = any(c.isdigit() for c in pw)
    return has_alpha and has_digit


@app.post("/api/register/with-token", status_code=status.HTTP_201_CREATED)
def register_with_token(request: RegisterWithTokenRequest, client_request: Request, response: Response):
    """Register a new user with an invite token."""
    
    # Validate required fields
    if not request.token or not request.token.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing token")
    if not request.name or not request.name.strip():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Name is required")
    if not request.email or not request.email.strip():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Email is required")
    if not request.password:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Password is required")
    
    # Rate limiting
    _rate_limit(client_request)
    
    # Validate password strength
    if not _validate_password(request.password):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Password must be at least 8 characters long and contain letters and numbers")
    
    # Check if user already exists
    if store.find_by_email(request.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User with this email already exists")
    
    # Initialize invite manager
    invite_manager = InviteTokenManager()
    
    # Validate token
    try:
        logger.info(f"Validating token for email: {request.email}")
        token_data = invite_manager.validate_invite_token(request.token.strip(), request.email)
        logger.info(f"Token validation successful: {token_data}")
    except Exception as e:
        logger.error(f"Token validation failed: {e}")
        raise
    
    # Create user
    try:
        logger.info(f"Creating user with email: {request.email}")
        user = store.create_user(
            username=request.email,  # Use email as username
            name=request.name,
            email=request.email,
            password=request.password
        )
        logger.info(f"User created successfully: {user.id}")
        
        # Mark token as used
        invite_manager.mark_token_as_used(request.token.strip(), request.email)
        logger.info("Token marked as used")
        
        # Create session
        _issue_session(response, user.id)
        logger.info("Session created")
        
        return {"message": "User registered successfully", "user": user}
        
    except Exception as e:
        logger.error(f"Failed to create user: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create user: {str(e)}")
