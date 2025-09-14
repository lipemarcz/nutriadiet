import React, { useState, useEffect } from 'react'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
// import { InviteToken } from '../../types/auth'

interface AdminPanelProps {
  onClose: () => void
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [inviteTokens, setInviteTokens] = useState<Array<{ id: string; token: string; criado_em?: string; usado?: boolean }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newTokenExpiresIn, setNewTokenExpiresIn] = useState(7)

  useEffect(() => {
    loadInviteTokens()
  }, [])

  const loadInviteTokens = async () => {
    try {
      setLoading(true)
      const resp = await fetch('/api/tokens', { credentials: 'include' })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.detail || 'Falha ao carregar tokens')
      setInviteTokens(data.items || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar tokens')
    } finally {
      setLoading(false)
    }
  }

  const createInviteToken = async () => {
    try {
      setLoading(true)
      setError(null)
      const resp = await fetch('/api/gerar-token', { method: 'POST', credentials: 'include' })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.detail || 'Falha ao gerar token')
      await loadInviteTokens()
      alert(`Token: ${data.token}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao gerar token')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gerador de Token</h2>
            <Button variant="secondary" onClick={onClose}>Fechar</Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Gerar Token */}
          <Card className="mb-6">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Gerar novo token</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expira em (dias)</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={newTokenExpiresIn}
                    onChange={(e) => setNewTokenExpiresIn(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={createInviteToken} disabled={loading} className="w-full">
                    {loading ? 'Gerando...' : 'Gerar token'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Lista */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Últimos tokens</h3>
            {loading && inviteTokens.length === 0 ? (
              <div className="text-center py-4">Carregando...</div>
            ) : inviteTokens.length === 0 ? (
              <div className="text-center py-4 text-gray-500">Nenhum token encontrado</div>
            ) : (
              <div className="space-y-3">
                {inviteTokens.map((token) => {
                  const isUsed = !!token.usado
                  return (
                    <Card key={token.id} className={`p-4 ${isUsed ? 'opacity-60' : ''}`}>
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{token.token}</p>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Criado em: {token.criado_em}</div>
                            <div className="text-sm">Usado? {isUsed ? 'Sim' : 'Não'}</div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
