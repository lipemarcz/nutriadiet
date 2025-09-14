import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../../components/Button'
import Card from '../../../components/Card'

interface InviteLoginFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export const InviteLoginForm: React.FC<InviteLoginFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const { signUp, signIn, loading, error, clearError } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    inviteToken: ''
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.email) {
      errors.email = 'E-mail é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Informe um e-mail válido'
    }
    
    if (!formData.password) {
      errors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      errors.password = 'Senha deve ter no mínimo 6 caracteres'
    }
    
    if (mode === 'signup' && !formData.inviteToken) {
      errors.inviteToken = 'Token é obrigatório para cadastro'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    if (!validateForm()) {
      return
    }

    try {
      if (mode === 'signin') {
        await signIn(formData.email, formData.password)
      } else {
        await signUp(formData.email.split('@')[0] || 'Usuário', formData.email, formData.password, formData.inviteToken)
      }
      onSuccess?.()
    } catch (err) {
      // handled
      console.error('Authentication error:', err)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
    if (error) {
      clearError()
    }
  }

  const switchMode = () => {
    setMode(prev => prev === 'signin' ? 'signup' : 'signin')
    setValidationErrors({})
    clearError()
  }

  return (
    <Card 
      title={mode === 'signin' ? 'Entrar' : 'Criar conta'}
      subtitle={mode === 'signin' ? 'Bem-vindo de volta' : 'Use seu Token de Convite'}
      padding="large"
      className="w-full max-w-md mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="seu@email.com"
            disabled={loading}
          />
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Mínimo 6 caracteres"
            disabled={loading}
          />
          {validationErrors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.password}</p>
          )}
        </div>

        {mode === 'signup' && (
          <div>
            <label htmlFor="inviteToken" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Token de Convite
            </label>
            <input
              id="inviteToken"
              type="text"
              value={formData.inviteToken}
              onChange={(e) => handleInputChange('inviteToken', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Token fornecido pelo administrador"
              disabled={loading}
            />
            {validationErrors.inviteToken && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.inviteToken}</p>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex flex-col space-y-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            {mode === 'signin' ? 'Entrar' : 'Criar conta'}
          </Button>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={switchMode}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              disabled={loading}
            >
              {mode === 'signin' ? 'Precisa de uma conta?' : 'Já possui conta?'}
            </button>

            {onCancel && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </form>
    </Card>
  )
}