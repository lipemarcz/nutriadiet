from __future__ import annotations

import logging
from fastapi import APIRouter, Depends, HTTPException, Request, status
from typing import List

from .invite_api import (
    invite_manager,
    CreateInviteTokenRequest,
    InviteTokenResponse,
    ValidateInviteTokenRequest,
    InviteTokenValidationResponse
)
# Legacy admin security removed - using local require_owner_or_admin instead
from .supabase_client import SupabaseClient

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/invite", tags=["invite-tokens"])

# Helper function to get current user from Supabase session
def get_current_user_id(request: Request) -> str:
    """Extract user ID from Supabase JWT token"""
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing or invalid authorization header"
            )
        
        token = auth_header.split(" ")[1]
        supabase = SupabaseClient()
        user = supabase.verify_jwt_token(token)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        return user["sub"]
        
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

def require_owner_or_admin(request: Request) -> str:
    """Require user to be owner or admin role"""
    try:
        user_id = get_current_user_id(request)
        supabase = SupabaseClient()
        
        # Get user role from user_roles table
        result = supabase.client.table("user_roles").select(
            "role"
        ).eq("user_id", user_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User role not found"
            )
        
        user_role = result.data[0]["role"]
        
        if user_role not in ["owner", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions. Owner or admin role required."
            )
        
        return user_id
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking user permissions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Permission check failed"
        )

@router.post("/create", response_model=InviteTokenResponse)
def create_invite_token(
    payload: CreateInviteTokenRequest,
    request: Request,
    current_user_id: str = Depends(require_owner_or_admin)
):
    """Create a new invite token (Owner/Admin only)"""
    try:
        return invite_manager.create_invite_token(
            email=payload.email,
            role=payload.role,
            expires_in_hours=payload.expires_in_hours,
            created_by_user_id=current_user_id
        )
    except Exception as e:
        logger.error(f"Error creating invite token: {e}")
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create invite token"
        )

@router.post("/validate", response_model=InviteTokenValidationResponse)
def validate_invite_token(payload: ValidateInviteTokenRequest):
    """Validate an invite token (Public endpoint for registration)"""
    try:
        return invite_manager.validate_invite_token(
            token=payload.token,
            email=payload.email
        )
    except Exception as e:
        logger.error(f"Error validating invite token: {e}")
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to validate invite token"
        )

@router.get("/list", response_model=List[InviteTokenResponse])
def list_invite_tokens(
    request: Request,
    current_user_id: str = Depends(require_owner_or_admin)
):
    """List all invite tokens (Owner/Admin only)"""
    try:
        # Get user's organization
        supabase = SupabaseClient()
        result = supabase.client.table("user_roles").select(
            "organization_id"
        ).eq("user_id", current_user_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User organization not found"
            )
        
        organization_id = result.data[0]["organization_id"]
        
        return invite_manager.list_invite_tokens(organization_id=organization_id)
        
    except Exception as e:
        logger.error(f"Error listing invite tokens: {e}")
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list invite tokens"
        )

@router.delete("/revoke/{token_id}")
def revoke_invite_token(
    token_id: str,
    request: Request,
    current_user_id: str = Depends(require_owner_or_admin)
):
    """Revoke an invite token (Owner/Admin only)"""
    try:
        success = invite_manager.revoke_invite_token(token_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invite token not found"
            )
        
        return {"status": "success", "message": "Invite token revoked"}
        
    except Exception as e:
        logger.error(f"Error revoking invite token: {e}")
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to revoke invite token"
        )

@router.post("/cleanup")
def cleanup_expired_tokens(
    request: Request,
    current_user_id: str = Depends(require_owner_or_admin)
):
    """Clean up expired invite tokens (Owner/Admin only)"""
    try:
        count = invite_manager.cleanup_expired_tokens()
        return {
            "status": "success",
            "message": f"Cleaned up {count} expired tokens"
        }
        
    except Exception as e:
        logger.error(f"Error cleaning up expired tokens: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cleanup expired tokens"
        )

# Legacy master admin endpoints removed - use /create and /list with proper authentication instead