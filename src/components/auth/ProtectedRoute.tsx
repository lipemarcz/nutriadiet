import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
// import { LoginForm } from './LoginForm'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  // const [isRegisterMode, setIsRegisterMode] = React.useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>
    }
    // rota restrita: redirecionar silenciosamente para página pública padrão
    return <>{fallback ?? null}</>
  }

  return <>{children}</>
}