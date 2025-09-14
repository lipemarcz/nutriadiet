import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const { signIn, signUp, loading, error, clearError } = useAuth()
  const [isRegisterMode, setIsRegisterMode] = useState(initialMode === 'register')
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
        onClose() // Fecha o modal após sucesso
      } else {
        await signIn(formData.email, formData.password)
        onClose() // Fecha o modal após sucesso
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

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode)
    clearError()
    setFormData({
      nome: '',
      email: '',
      password: '',
      inviteToken: '',
    })
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
          <Card padding="large" className="bg-white dark:bg-gray-800 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-white">
                {isRegisterMode ? 'Criar conta' : 'Entrar'}
              </Dialog.Title>
              <Dialog.Close asChild>
                <Button variant="secondary" size="sm" className="p-2">
                  <X size={16} />
                </Button>
              </Dialog.Close>
            </div>

            <div className="mb-6">
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                {isRegisterMode ? (
                  <>
                    Já possui conta?{' '}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="font-medium text-green-600 hover:text-green-500"
                    >
                      Entrar
                    </button>
                  </>
                ) : (
                  <>
                    Precisa de uma conta?{' '}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="font-medium text-green-600 hover:text-green-500"
                    >
                      Cadastre-se com Token de Convite
                    </button>
                  </>
                )}
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded relative">
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
                  <label htmlFor="inviteToken" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Token de Convite
                  </label>
                  <input
                    id="inviteToken"
                    name="inviteToken"
                    type="text"
                    required={isRegisterMode}
                    value={formData.inviteToken}
                    onChange={handleInputChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                    placeholder="Token fornecido pelo administrador"
                  />
                </div>
              )}

              {isRegisterMode && (
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nome
                  </label>
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                    placeholder="Seu nome completo"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                    className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <span className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400">
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </span>
                  </button>
                </div>
                {isRegisterMode && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Senha deve ter no mínimo 6 caracteres
                  </p>
                )}
              </div>

              <div className="pt-2">
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}