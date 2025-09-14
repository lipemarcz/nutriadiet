from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status
from pydantic import BaseModel
import secrets
import uuid

from .supabase_client import SupabaseClient
from .services.invite_tokens import generate_token, hash_token

logger = logging.getLogger(__name__)

# Pydantic models for invite token management
class CreateInviteTokenRequest(BaseModel):
    email: str
    role: str = "member"  # member, admin, owner
    expires_in_hours: int = 72  # Default 3 days

class InviteTokenResponse(BaseModel):
    id: str
    token: str
    email: str
    role: str
    expires_at: str
    created_at: str
    used: bool

class ValidateInviteTokenRequest(BaseModel):
    token: str
    email: str

class InviteTokenValidationResponse(BaseModel):
    valid: bool
    email: str
    role: str
    organization_id: Optional[str]
    expires_at: str

class InviteTokenManager:
    """Manages invite tokens for organization-based user registration"""
    
    def __init__(self):
        self.supabase = SupabaseClient()
    
    def create_invite_token(
        self, 
        email: str, 
        role: str = "member", 
        expires_in_hours: int = 72,
        created_by_user_id: str = None
    ) -> InviteTokenResponse:
        """Create a new invite token for user registration"""
        try:
            # Validate role
            if role not in ["member", "admin", "owner"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid role. Must be member, admin, or owner"
                )
            
            # Generate secure token and hash
            token = generate_token()
            token_hash = hash_token(token)
            token_id = str(uuid.uuid4())
            
            # Calculate expiration
            expires_at = datetime.utcnow() + timedelta(hours=expires_in_hours)
            
            # Get organization ID (assuming single organization for now)
            org_result = self.supabase.client.table("organizations").select("id").limit(1).execute()
            if not org_result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="No organization found"
                )
            organization_id = org_result.data[0]["id"]
            
            # Insert invite token
            invite_data = {
                "id": token_id,
                "token_hash": token_hash,
                "email": email.lower().strip(),
                "role": role,
                "organization_id": organization_id,
                "expires_at": expires_at.isoformat(),
                "created_by": created_by_user_id
            }
            
            result = self.supabase.client.table("invite_tokens").insert(invite_data).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create invite token"
                )
            
            created_token = result.data[0]
            
            return InviteTokenResponse(
                id=created_token["id"],
                token=token,  # Return the original token, not from DB
                email=created_token["email"],
                role=created_token["role"],
                expires_at=created_token["expires_at"],
                created_at=created_token["created_at"],
                used=created_token.get("used_at") is not None
            )
            
        except Exception as e:
            logger.error(f"Error creating invite token: {e}")
            if isinstance(e, HTTPException):
                raise
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create invite token"
            )
    
    def validate_invite_token(self, token: str, email: str) -> InviteTokenValidationResponse:
        """Validate an invite token for user registration"""
        try:
            # Hash the token to find it in database
            token_hash = hash_token(token)
            
            # Find the invite token
            result = self.supabase.client.table("invite_tokens").select(
                "id, email, role, organization_id, expires_at, used_at"
            ).eq("token_hash", token_hash).eq("email", email.lower().strip()).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Invalid token"
                )
            
            invite = result.data[0]
            
            # Check if token is already used
            if invite["used_at"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invite token has already been used"
                )
            
            # Check if token is expired
            expires_at = datetime.fromisoformat(invite["expires_at"].replace('Z', '+00:00'))
            if datetime.utcnow() > expires_at.replace(tzinfo=None):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invite token has expired"
                )
            
            return InviteTokenValidationResponse(
                valid=True,
                email=invite["email"],
                role=invite["role"],
                organization_id=invite["organization_id"],
                expires_at=invite["expires_at"]
            )
            
        except Exception as e:
            logger.error(f"Error validating invite token: {e}")
            if isinstance(e, HTTPException):
                raise
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to validate invite token"
            )
    
    def mark_token_as_used(self, token: str, email: str) -> bool:
        """Mark an invite token as used after successful registration"""
        try:
            # Hash the token to find it in database
            token_hash = hash_token(token)
            
            result = self.supabase.client.table("invite_tokens").update({
                "used_at": datetime.utcnow().isoformat()
            }).eq("token_hash", token_hash).eq("email", email.lower().strip()).execute()
            
            return len(result.data) > 0
            
        except Exception as e:
            logger.error(f"Error marking token as used: {e}")
            return False
    
    def list_invite_tokens(self, organization_id: str = None) -> list[InviteTokenResponse]:
        """List all invite tokens for an organization"""
        try:
            query = self.supabase.client.table("invite_tokens").select(
                "id, email, role, expires_at, created_at, used_at"
            )
            
            if organization_id:
                query = query.eq("organization_id", organization_id)
            
            result = query.order("created_at", desc=True).execute()
            
            return [
                InviteTokenResponse(
                    id=token["id"],
                    token="[hidden]",  # Don't expose token hashes
                    email=token["email"],
                    role=token["role"],
                    expires_at=token["expires_at"],
                    created_at=token["created_at"],
                    used=bool(token["used_at"])
                )
                for token in result.data
            ]
            
        except Exception as e:
            logger.error(f"Error listing invite tokens: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to list invite tokens"
            )
    
    def revoke_invite_token(self, token_id: str) -> bool:
        """Revoke (delete) an invite token"""
        try:
            result = self.supabase.client.table("invite_tokens").delete().eq("id", token_id).execute()
            return len(result.data) > 0
            
        except Exception as e:
            logger.error(f"Error revoking invite token: {e}")
            return False
    
    def cleanup_expired_tokens(self) -> int:
        """Remove expired invite tokens from the database"""
        try:
            current_time = datetime.utcnow().isoformat()
            result = self.supabase.client.table("invite_tokens").delete().lt("expires_at", current_time).execute()
            return len(result.data)
            
        except Exception as e:
            logger.error(f"Error cleaning up expired tokens: {e}")
            return 0

# Global instance
invite_manager = InviteTokenManager()