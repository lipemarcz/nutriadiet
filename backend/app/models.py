from __future__ import annotations

from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
import uuid


class PublicUser(BaseModel):
    id: str
    username: str
    email: Optional[EmailStr] = None
    name: str
    profession: Optional[str] = None
    photo_data_url: Optional[str] = None
    is_admin: bool = False
    created_at: str
    updated_at: str


class StoredUser(PublicUser):
    password_hash: str = Field(..., description="bcrypt hash")


class CreateUserRequest(BaseModel):
    username: str
    name: str
    password: str
    email: Optional[EmailStr] = None
    profession: Optional[str] = None


class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    profession: Optional[str] = None
    photo_data_url: Optional[str] = None


class ResetPasswordRequest(BaseModel):
    new_password: str


class InviteToken(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    token_hash: str = Field(..., description="HMAC-SHA256 hash of the token")
    email_hint: Optional[str] = None
    role: Optional[str] = Field(None, description="owner, admin, or member")
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    used_at: Optional[datetime] = None
    revoked: bool = False


class RegisterWithTokenRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    token: str

