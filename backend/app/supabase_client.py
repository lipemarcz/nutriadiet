import os
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import Optional, Dict, Any
import hashlib
import secrets
from datetime import datetime, timedelta

# Load environment variables, preferring backend/.env, then falling back to project .env
try:
    backend_env = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
    project_env = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.env')
    if os.path.exists(backend_env):
        load_dotenv(backend_env, override=False)
        print(f"DEBUG: Using env file: {backend_env}")
    elif os.path.exists(project_env):
        load_dotenv(project_env, override=False)
        print(f"DEBUG: Using env file: {project_env}")
    else:
        load_dotenv()
        print("DEBUG: No .env file found explicitly; loaded default environment")
except Exception as e:
    print(f"DEBUG: Error loading env files: {e}")

class SupabaseClient:
    def __init__(self):
        url: str = os.environ.get("VITE_SUPABASE_URL")
        service_role_key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        
        if not url or not service_role_key:
            raise ValueError("Missing Supabase environment variables")
        
        self.client: Client = create_client(url, service_role_key)
        self.organization_id = os.environ.get("ORGANIZATION_ID", "00000000-0000-0000-0000-000000000001")
        self.invite_secret = os.environ.get("INVITE_TOKEN_SECRET", "default-secret")
        self.token_expiry_hours = int(os.environ.get("INVITE_TOKEN_EXPIRY_HOURS", "24"))
    
    def create_user(self, email: str, password: str) -> Dict[str, Any]:
        """Create a new user via Supabase Auth"""
        try:
            response = self.client.auth.admin.create_user({
                "email": email,
                "password": password,
                "email_confirm": True
            })
            return {"success": True, "user": response.user}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def assign_user_role(self, user_id: str, role: str) -> Dict[str, Any]:
        """Assign a role to a user in the organization"""
        try:
            response = self.client.table("user_roles").insert({
                "user_id": user_id,
                "organization_id": self.organization_id,
                "role": role
            }).execute()
            return {"success": True, "data": response.data}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_user_role(self, user_id: str) -> Optional[str]:
        """Get user's role in the organization"""
        try:
            response = self.client.table("user_roles").select("role").eq(
                "user_id", user_id
            ).eq(
                "organization_id", self.organization_id
            ).single().execute()
            
            if response.data:
                return response.data["role"]
            return None
        except Exception:
            return None
    
    def generate_invite_token(self, email: str, role: str, created_by: str) -> Dict[str, Any]:
        """Generate a new invite token"""
        try:
            # Generate secure random token
            token = secrets.token_urlsafe(32)
            token_hash = hashlib.sha256(f"{token}{self.invite_secret}".encode()).hexdigest()
            
            # Calculate expiration
            expires_at = datetime.utcnow() + timedelta(hours=self.token_expiry_hours)
            
            # Store in database
            response = self.client.table("invite_tokens").insert({
                "token_hash": token_hash,
                "email": email,
                "role": role,
                "organization_id": self.organization_id,
                "created_by": created_by,
                "expires_at": expires_at.isoformat()
            }).execute()
            
            return {
                "success": True,
                "token": token,
                "expires_at": expires_at.isoformat(),
                "data": response.data
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def validate_invite_token(self, token: str) -> Dict[str, Any]:
        """Validate an invite token"""
        try:
            token_hash = hashlib.sha256(f"{token}{self.invite_secret}".encode()).hexdigest()
            
            response = self.client.table("invite_tokens").select("*").eq(
                "token_hash", token_hash
            ).is_("used_at", "null").execute()
            
            if not response.data:
                return {"success": False, "error": "Invalid or used token"}
            
            token_data = response.data[0]
            expires_at = datetime.fromisoformat(token_data["expires_at"].replace('Z', '+00:00'))
            
            if datetime.utcnow().replace(tzinfo=expires_at.tzinfo) > expires_at:
                return {"success": False, "error": "Token expired"}
            
            return {
                "success": True,
                "email": token_data["email"],
                "role": token_data["role"],
                "token_id": token_data["id"]
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def mark_token_used(self, token_id: str) -> Dict[str, Any]:
        """Mark an invite token as used"""
        try:
            response = self.client.table("invite_tokens").update({
                "used_at": datetime.utcnow().isoformat()
            }).eq("id", token_id).execute()
            
            return {"success": True, "data": response.data}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_organization_users(self) -> Dict[str, Any]:
        """Get all users in the organization"""
        try:
            response = self.client.table("user_roles").select(
                "user_id, role, created_at, auth.users(email)"
            ).eq("organization_id", self.organization_id).execute()
            
            return {"success": True, "users": response.data}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def verify_jwt_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify a JWT token and return user info"""
        try:
            response = self.client.auth.get_user(token)
            if response.user:
                return {
                    "sub": response.user.id,
                    "email": response.user.email,
                    "id": response.user.id
                }
            return None
        except Exception as e:
            return None

# Global instance
supabase_client = SupabaseClient()
