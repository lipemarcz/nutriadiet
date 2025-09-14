import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../../components/Button'
import Card from '../../../components/Card'

interface LoginFormProps {
  onToggleMode: () => void
  isRegisterMode: boolean
}

export function LoginForm({ onToggleMode, isRegisterMode }: LoginFormProps) {
  const { signIn, signUp, loading, error, clearError } = useAuth()
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    inviteToken: '',
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      if (isRegisterMode) {
        if (!formData.inviteToken.trim()) {
          throw new Error('Token é obrigatório para cadastro')
        }
        const nome = formData.nome.trim() || (formData.email.split('@')[0] || 'Usuário')
        await signUp(nome, formData.email, formData.password, formData.inviteToken)
      } else {
        await signIn(formData.email, formData.password)
      }
    } catch (error) {
      // Error is handled by the auth context
      console.error('Authentication error:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isRegisterMode ? 'Criar conta' : 'Entrar'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isRegisterMode ? (
              <>
                Já possui conta?{' '}
                <button
                  type="button"
                  onClick={onToggleMode}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Entrar
                </button>
              </>
            ) : (
              <>
                Precisa de uma conta?{' '}
                <button
                  type="button"
                  onClick={onToggleMode}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Cadastre-se com Token de Convite
                </button>
              </>
            )}
          </p>
        </div>

        <Card padding="large" className="max-w-md mx-auto">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">{error}</span>
                <button
                  type="button"
                  onClick={clearError}
                  className="absolute top-0 bottom-0 right-0 px-4 py-3"
                >
                  <span className="sr-only">Dismiss</span>
                  &#x2715;
                </button>
              </div>
            )}

            {isRegisterMode && (
              <div>
                <label htmlFor="inviteToken" className="block text-sm font-medium text-gray-700">
                  Token de Convite
                </label>
                <input
                  id="inviteToken"
                  name="inviteToken"
                  type="text"
                  required={isRegisterMode}
                  value={formData.inviteToken}
                  onChange={handleInputChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Token fornecido pelo administrador"
                />
              </div>
            )}

            {isRegisterMode && (
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Seu nome completo"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <span className="text-gray-400 hover:text-gray-600">
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </span>
                </button>
              </div>
              {isRegisterMode && (
                <p className="mt-1 text-xs text-gray-500">
                  Senha deve ter no mínimo 6 caracteres
                </p>
              )}
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading}
                loading={loading}
                variant="primary"
                size="md"
                className="w-full"
              >
                {isRegisterMode ? 'Criar conta' : 'Entrar'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}