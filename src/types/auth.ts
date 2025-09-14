// Authentication types for the invite-based system

export interface User {
  id: string
  email: string
  created_at: string
}

export interface Organization {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface UserRole {
  id: string
  user_id: string
  organization_id: string
  role: 'owner' | 'member'
  created_at: string
  updated_at: string
}

export interface InviteToken {
  id: string
  token_hash: string
  email: string
  role: 'owner' | 'member'
  organization_id: string
  created_by: string
  expires_at: string
  used_at?: string
  created_at: string
}

export interface AuthState {
  user: User | null
  organization: Organization | null
  userRole: UserRole | null
  loading: boolean
  error: string | null
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpCredentials {
  email: string
  password: string
  inviteToken?: string
}

export interface CreateInviteTokenData {
  email: string
  role: 'owner' | 'member'
  organization_id: string
}