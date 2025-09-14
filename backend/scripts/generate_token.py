#!/usr/bin/env python3
"""
Generate invite tokens for user registration.

Usage:
    python scripts/generate_token.py --expires-hours 24 --role owner --email-hint "user@example.com"
"""

import argparse
import os
import sys
import secrets
import base64
from datetime import datetime, timedelta
from typing import Optional

# Add the parent directory to the path so we can import from app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.invite_tokens import generate_token, hash_token
from app.supabase_client import supabase_client

# Ensure we load env from backend/.env first, then fall back to project .env
try:
    from dotenv import load_dotenv
    import os
    backend_env = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
    project_env = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.env')
    if os.path.exists(backend_env):
        load_dotenv(backend_env, override=False)
        print(f"Using env file: {backend_env}")
    elif os.path.exists(project_env):
        load_dotenv(project_env, override=False)
        print(f"Using env file: {project_env}")
    else:
        # Load from process env only
        print("No .env file found; using process environment")
except Exception:
    pass


def main():
    parser = argparse.ArgumentParser(description='Generate invite tokens for user registration')
    parser.add_argument('--expires-hours', type=int, default=24, help='Token expiry in hours (default: 24)')
    parser.add_argument('--role', type=str, choices=['owner', 'admin', 'member'], help='User role')
    parser.add_argument('--email-hint', type=str, help='Email hint for the token')
    parser.add_argument('--created-by', type=str, default='cli', help='Who created this token (default: cli)')
    
    args = parser.parse_args()
    
    try:
        # Load environment variables
        from dotenv import load_dotenv
        load_dotenv()
        
        # Generate the token
        token = generate_token()
        token_hash = hash_token(token)
        
        # Calculate expiry
        expires_at = datetime.utcnow() + timedelta(hours=args.expires_hours)
        
        # Get organization ID (assuming single organization for now)
        org_result = supabase_client.client.table("organizations").select("id").limit(1).execute()
        if not org_result.data:
            print("Error: No organization found in database")
            sys.exit(1)
        organization_id = org_result.data[0]["id"]
        
        # Insert into database
        token_data = {
            'token_hash': token_hash,
            'email': args.email_hint or 'unknown@example.com',
            'role': args.role or 'member',
            'organization_id': organization_id,
            'expires_at': expires_at.isoformat()
        }
        
        # Only add created_by if it's a valid UUID (not CLI)
        if args.created_by != 'cli':
            token_data['created_by'] = args.created_by
            
        result = supabase_client.client.table('invite_tokens').insert(token_data).execute()
        
        if result.data:
            print(f"Token generated: {token}")
            print(f"Use within {args.expires_hours}h.")
            if args.email_hint:
                print(f"Email hint: {args.email_hint}")
            if args.role:
                print(f"Role: {args.role}")
        else:
            print("Error: Failed to create token in database")
            sys.exit(1)
            
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
