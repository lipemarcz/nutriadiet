#!/usr/bin/env python3
"""
Script to check existing users and assign Owner roles if missing.
"""

import sys
import os
from typing import List, Dict

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase_client import SupabaseClient

# Master accounts emails
MASTER_EMAILS = [
    "master1@bmteam.com",
    "master2@bmteam.com", 
    "master3@bmteam.com"
]

def check_and_assign_roles():
    """
    Check if master accounts exist and assign Owner roles if missing.
    """
    supabase_client = SupabaseClient()
    
    print("Checking master accounts and assigning roles...")
    print(f"Organization ID: {supabase_client.organization_id}")
    
    # Get all users from auth.users table
    try:
        # Get all users using admin API
        auth_response = supabase_client.client.auth.admin.list_users()
        
        if not auth_response:
            print("No users found")
            return False
            
        print(f"Found {len(auth_response)} total users")
        
        # Find our master users
        master_users = []
        for user in auth_response:
            if user.email in MASTER_EMAILS:
                master_users.append({'id': user.id, 'email': user.email})
                
        print(f"Found {len(master_users)} master users:")
        for user in master_users:
            print(f"  - {user['email']} (ID: {user['id']})")
            
        # Check existing roles
        roles_response = supabase_client.client.table("user_roles").select("*").eq(
            "organization_id", supabase_client.organization_id
        ).execute()
        
        existing_roles = {role['user_id']: role for role in roles_response.data}
        print(f"\nFound {len(existing_roles)} existing role assignments")
        
        # Assign missing roles
        assigned_count = 0
        for user in master_users:
            user_id = user['id']
            email = user['email']
            
            if user_id in existing_roles:
                existing_role = existing_roles[user_id]['role']
                print(f"✓ {email} already has role: {existing_role}")
            else:
                print(f"⚠ {email} missing role, assigning 'owner'...")
                
                # Assign owner role
                role_result = supabase_client.assign_user_role(
                    user_id=user_id,
                    role="owner"
                )
                
                if role_result['success']:
                    print(f"✓ Successfully assigned 'owner' role to {email}")
                    assigned_count += 1
                else:
                    print(f"✗ Failed to assign role to {email}: {role_result.get('error')}")
                    
        print(f"\nSummary: Assigned {assigned_count} new role(s)")
        return True
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def main():
    print("BM-TEAM Role Assignment Checker")
    print("=" * 40)
    
    try:
        success = check_and_assign_roles()
        
        if success:
            print("\n🎉 Role assignment check completed!")
            return 0
        else:
            print("\n❌ Role assignment check failed.")
            return 1
            
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)