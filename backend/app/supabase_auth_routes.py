from __future__ import annotations

import logging
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional

from .supabase_client import SupabaseClient
from .invite_api import invite_manager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["supabase-auth"])

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    invite_token: str

class RegisterResponse(BaseModel):
    success: bool
    message: str
    user_id: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    success: bool
    message: str
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    user: Optional[dict] = None

@router.post("/register", response_model=RegisterResponse)
def register_with_invite(payload: RegisterRequest):
    """Register a new user with invite token"""
    try:
        # Validate invite token
        validation_result = invite_manager.validate_invite_token(
            token=payload.invite_token,
            email=payload.email
        )
        
        if not validation_result.valid:
            # Keep message generic to avoid leaking info
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired invite token"
            )
        
        # Create user in Supabase Auth
        supabase = SupabaseClient()
        user_result = supabase.create_user(
            email=payload.email,
            password=payload.password
        )
        
        if not user_result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create user: {user_result['error']}"
            )
        
        user_id = user_result["user"].id
        
        # Assign role to user
        role_result = supabase.assign_user_role(
            user_id=user_id,
            role=validation_result.role
        )
        
        if not role_result["success"]:
            logger.error(f"Failed to assign role: {role_result['error']}")
            # Note: User is created but role assignment failed
            # In production, you might want to implement cleanup
        
        # Mark invite token as used (by plain token + email)
        try:
            invite_manager.mark_token_as_used(payload.invite_token, payload.email)
        except Exception:
            # Don’t fail registration if marking used fails; just log
            logger.warning("Failed to mark invite token as used")
        
        return RegisterResponse(
            success=True,
            message="User registered successfully",
            user_id=user_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=LoginResponse)
def login_user(payload: LoginRequest):
    """Login user with Supabase Auth"""
    try:
        supabase = SupabaseClient()
        
        # Authenticate with Supabase
        response = supabase.client.auth.sign_in_with_password({
            "email": payload.email,
            "password": payload.password
        })
        
        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Get user role
        user_role = supabase.get_user_role(response.user.id)
        
        # Prepare user data
        user_data = {
            "id": response.user.id,
            "email": response.user.email,
            "role": user_role,
            "organizationId": supabase.organization_id,
            "organizationName": "BM-TEAM"
        }
        
        return LoginResponse(
            success=True,
            message="Login successful",
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            user=user_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Login failed"
        )

@router.post("/logout")
def logout_user():
    """Logout user (client-side token removal)"""
    return {"success": True, "message": "Logout successful"}

@router.get("/me")
def get_current_user():
    """Get current user info (requires client to send token)"""
    # This endpoint would typically require authentication middleware
    # For now, return a placeholder response
    return {"success": True, "message": "User info endpoint"}
