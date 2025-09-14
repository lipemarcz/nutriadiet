import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type Papel = 'master' | 'colaborador'

export interface AuthUser {
  id: string
  email: string
  papel: Papel
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  error: string | null
  signIn: (email: string, senha: string) => Promise<void>
  signUp: (nome: string, email: string, senha: string, token: string) => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch('/api/me', { credentials: 'include' })
      if (!res.ok) {
        setUser(null)
        try { localStorage.removeItem('auth:user') } catch { /* ignore */ }
        return
      }
      const data = await res.json()
      const next = { id: data.id as string, email: data.email as string, papel: data.papel as Papel }
      setUser(next)
      try { localStorage.setItem('auth:user', JSON.stringify({ id: next.id, email: next.email })) } catch { /* ignore */ }
    } catch {
      setUser(null)
      try { localStorage.removeItem('auth:user') } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      await fetchMe()
      setLoading(false)
    })()
  }, [fetchMe])

  const signIn = async (email: string, senha: string) => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/entrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, senha }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'E-mail ou senha incorretos.')
      }
      await fetchMe()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao entrar')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (nome: string, email: string, senha: string, token: string) => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nome, email, senha, token }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Falha no cadastro')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no cadastro')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)
      await fetch('/api/sair', { method: 'POST', credentials: 'include' })
      setUser(null)
      try { localStorage.removeItem('auth:user') } catch { /* ignore */ }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao sair')
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => setError(null)

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
