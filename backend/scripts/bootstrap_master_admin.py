#!/usr/bin/env python3
"""
Bootstrap a master owner account in Supabase and assign 'owner' role.

Usage:
  python backend/scripts/bootstrap_master_admin.py

Requires in backend/.env (or environment):
  - VITE_SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - ORGANIZATION_ID
  - ADMIN_EMAIL
  - ADMIN_PASSWORD

SECURITY: Do not keep ADMIN_PASSWORD in .env after seeding; remove it.
"""

import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(HERE)
PROJECT_DIR = os.path.dirname(BACKEND_DIR)

try:
    from dotenv import load_dotenv  # type: ignore
    backend_env = os.path.join(BACKEND_DIR, '.env')
    project_env = os.path.join(PROJECT_DIR, '.env')
    if os.path.exists(backend_env):
        load_dotenv(backend_env, override=False)
        print(f"Using env file: {backend_env}")
    elif os.path.exists(project_env):
        load_dotenv(project_env, override=False)
        print(f"Using env file: {project_env}")
    else:
        print("No .env file found; using process environment")
except Exception:
    pass

from app.supabase_client import SupabaseClient  # noqa: E402


def main() -> int:
    email = os.getenv('ADMIN_EMAIL')
    password = os.getenv('ADMIN_PASSWORD')
    if not email or not password:
        print("ERROR: ADMIN_EMAIL and ADMIN_PASSWORD are required in env to bootstrap.")
        return 1

    try:
        sb = SupabaseClient()
    except Exception as e:
        print(f"ERROR: Supabase client init failed: {e}")
        return 1

    print(f"Creating admin user {email}...")
    res = sb.create_user(email=email, password=password)
    if not res.get('success'):
        print(f"ERROR: Failed to create user: {res.get('error')}")
        return 1

    user = res['user']
    print(f"User created: {user.id}")

    print("Assigning 'owner' role...")
    role_res = sb.assign_user_role(user_id=user.id, role='owner')
    if not role_res.get('success'):
        print(f"WARNING: Role assignment failed: {role_res.get('error')}")
    else:
        print("Owner role assigned.")

    print("Done. You can now sign in via the frontend with the seeded credentials.")
    print("SECURITY: Remove ADMIN_PASSWORD from your .env after seeding.")
    return 0


if __name__ == '__main__':
    sys.exit(main())

