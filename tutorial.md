# NUTRIA — Account Creation and Admin Access Guide

This project uses an invite-only registration model backed by Supabase Auth. There is no baked-in default admin password in the repo. You bootstrap the first owner/admin via an invite token or by creating a Supabase Auth user and assigning the owner role.

Important
- Never commit real secrets. Use `.env` files locally only.
- Frontend can only use `VITE_`-prefixed env vars. Server-only secrets must NOT be prefixed with `VITE_`.

## 1) Prerequisites

- Node 18+ and npm
- Python 3.11+ (for backend) and pip
- Supabase project (get URL and keys from your Supabase dashboard)
- Two .env files with placeholders only:
  - `./.env` (frontend)
    - `VITE_SUPABASE_URL=...`
    - `VITE_SUPABASE_ANON_KEY=...`
    - `INVITE_TOKEN_SECRET=your-strong-random-secret`
  - `./backend/.env` (backend)
    - `VITE_SUPABASE_URL=...`
    - `SUPABASE_SERVICE_ROLE_KEY=...`  ← server-only
    - `ORGANIZATION_ID=00000000-0000-0000-0000-000000000001` (or your real org row id)
    - `INVITE_TOKEN_SECRET=your-strong-random-secret`

Notes
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend.
- Ensure the Supabase SQL migrations for `organizations`, `user_roles`, and `invite_tokens` exist in your project.

## 2) Install and Start

Frontend
- `npm install`
- Dev server: `npm run dev` (http://localhost:5173)
- Build + preview: `npm run build && npm run preview` (http://localhost:4173)

Backend (FastAPI)
- `python -m venv .venv`
- Windows: `.\.venv\Scripts\Activate.ps1`  •  macOS/Linux: `source .venv/bin/activate`
- `pip install -r backend/requirements.txt`
- Start API: `uvicorn backend.app.main:app --reload --port 8000`

Tip: If pip tries to build native wheels on Windows, prefer running in WSL/Ubuntu or ensure a proper toolchain is available.

## 3) Create the First Account (Invite-Only)

Recommended (Owner via invite token):
1) Generate an invite token with role `owner` (CLI script)
   - `python backend/scripts/generate_token.py --expires-hours 24 --role owner --email-hint you@example.com`
   - Copy the printed token (keep it secret).
2) Register using the token
   - Backend route (server generates user in Supabase):
     - PowerShell example:
       ```powershell
       $body = @{ email='you@example.com'; password='Passw0rd123'; name='You'; invite_token='<PASTE_TOKEN>' } | ConvertTo-Json
       Invoke-RestMethod -Method Post -Uri http://localhost:8000/api/auth/register -ContentType 'application/json' -Body $body
       ```
   - Or use the frontend Invite form (switch to “Create Account” and paste the token).
3) Login in the app
   - Open http://localhost:5173
   - Use your email and password.
   - The account should carry the `owner` role (stored in `user_roles`).

Alternative (Create Supabase user then assign owner role):
1) In the Supabase dashboard → Authentication → Add user (email + password)
2) Insert a row in `user_roles` mapping that user id to your organization with role `owner`.
   - You can also run `backend/app/check_and_assign_roles.py` after adding the user to auto-assign owners for emails listed in that file (see section 5).

## 4) Verifying Access (Restrita)

- While logged out, the “Restrita” page (`/restrito`) remains inaccessible.
- After logging in with a valid invite, visit http://localhost:5173/restrito — the protected content is available.

## 5) “Admin Master Account” — Where is it?

There is no default master admin username/password stored in the repository.
- Historical/legacy: older docs referenced a master admin via env (e.g., `ADMIN_USER` and `ADMIN_PASS_HASH`). The current codebase removed those endpoints and uses Supabase-backed invites and roles instead.
- Bootstrap options now:
  - Use the invite flow with role `owner` (section 3), or
  - Create a Supabase user and assign `owner` in `user_roles`.

Helper script for assigning owners
- File: `backend/app/check_and_assign_roles.py`
- This script looks for emails listed in `MASTER_EMAILS` inside that file and assigns the `owner` role to matching Supabase Auth users.
- Steps:
  1) Create those users in Supabase Auth (dashboard) with any secure password you choose.
  2) Ensure backend `.env` has a valid `SUPABASE_SERVICE_ROLE_KEY`.
  3) Run: `python backend/app/check_and_assign_roles.py`
- Passwords are set by you in Supabase; the repository doesn’t contain or generate them.

## 6) Environment Safety

- Never commit `.env` with real values.
- Frontend only needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Backend requires `SUPABASE_SERVICE_ROLE_KEY` for admin operations (token minting, role assignment).
- `INVITE_TOKEN_SECRET` must be a strong random string (generate with Python: `python -c "import secrets; print(secrets.token_urlsafe(32))"`).

## 7) Quick Troubleshooting

- “Login succeeds but no owner features”: ensure a `user_roles` row exists for your user with `role='owner'` and correct `organization_id`.
- “Token invalid”: ensure you pasted the plain token (not the hash) and it hasn’t expired or been used.
- “Frontend can’t connect”: confirm `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set; check browser console.
- “Backend errors with Supabase”: verify `SUPABASE_SERVICE_ROLE_KEY` and network access; check FastAPI logs.

---
If you want, I can also set up a scripted check that: (1) mints an invite, (2) registers with it, (3) confirms the user in Supabase, and (4) verifies `/restrito` visibility logged in vs logged out.
