import os
from fastapi.testclient import TestClient
import pytest

# Ensure env for app import side effects
os.environ.setdefault("CORS_ORIGINS", "*")
os.environ.setdefault("REGISTER_RATE_LIMIT_PER_MIN", "1000")

from app.main import app  # noqa: E402

client = TestClient(app)


def test_health_ok():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_register_with_token_missing_fields():
    # Missing token
    payload = {
        "name": "John",
        "email": "john@example.com",
        "password": "Passw0rd1",
        # token missing
    }
    r = client.post("/api/register/with-token", json=payload)
    # Pydantic enforces required token -> 422 Unprocessable Entity
    assert r.status_code == 422
    body = r.json()
    assert body["detail"][0]["loc"][:2] == ["body", "token"]


def test_register_with_token_weak_password():
    payload = {
        "name": "Jane",
        "email": "jane@example.com",
        "password": "short",
        "token": "dummy"
    }
    r = client.post("/api/register/with-token", json=payload)
    assert r.status_code == 422
    assert "Password" in r.json().get("detail", "")


def test_register_with_token_missing_email_pydantic():
    # Pydantic should fail when email is not a valid EmailStr
    payload = {
        "name": "Foo",
        "email": "not-an-email",
        "password": "Password1",
        "token": "dummy"
    }
    r = client.post("/api/register/with-token", json=payload)
    # FastAPI converts Pydantic ValidationError to 422
    assert r.status_code == 422
    body = r.json()
    assert body["detail"][0]["loc"][:2] == ["body", "email"]