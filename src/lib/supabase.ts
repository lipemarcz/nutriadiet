import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// Auth types
export interface User {
  id: string
  email: string
  role: 'owner' | 'member'
  organizationId: string
  organizationName: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

// Auth functions
export const authService = {
  async signInWithPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    
    // Get user role and organization
    if (data.user) {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select(`
          role,
          organization_id,
          organizations(name)
        `)
        .eq('user_id', data.user.id)
        .single()
      
      if (roleError) throw roleError
      
      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
          role: roleData.role,
          organizationId: roleData.organization_id,
          organizationName: roleData.organizations[0]?.name || '',
        },
        session: data.session,
      }
    }
    
    return { user: null, session: null }
  },
  
  async signUp(email: string, password: string, inviteToken: string) {
    // First validate the invite token
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name: email.split('@')[0], // Use email prefix as name
        invite_token: inviteToken,
      }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Registration failed')
    }
    
    const result = await response.json()
    return result
  },
  
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },
  
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null
    
    // Get user role and organization
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select(`
        role,
        organization_id,
        organizations(name)
      `)
      .eq('user_id', user.id)
      .single()
    
    if (roleError) return null
    
    return {
      id: user.id,
      email: user.email!,
      role: roleData.role,
      organizationId: roleData.organization_id,
      organizationName: roleData.organizations[0]?.name || '',
    }
  },
  
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser()
        callback(user)
      } else {
        callback(null)
      }
    })
  },
}