import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { acceptInviteToken, hasAcceptedInviteFor } from '../../utils/auth'
import { useAuth } from '../../contexts/AuthContext'

interface InviteGateProps {
  children: React.ReactNode
}

export const InviteGate: React.FC<InviteGateProps> = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [accepted, setAccepted] = useState<boolean>(() => hasAcceptedInviteFor('BMTEAM'))

  const inviteToken = useMemo(() => {
    try {
      const params = new URLSearchParams(location.search)
      return params.get('invite')
    } catch {
      return null
    }
  }, [location.search])

  useEffect(() => {
    if (inviteToken) {
      acceptInviteToken(inviteToken, 'BMTEAM')
      setAccepted(true)
    }
  }, [inviteToken])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse rounded-md h-10 w-48 bg-gray-700 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-[#2a3040] bg-[#151923] p-6">
              <div className="h-6 w-40 bg-gray-700 rounded mb-4" />
              <div className="h-4 w-full bg-gray-700 rounded mb-2" />
              <div className="h-4 w-2/3 bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!user || !accepted) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto rounded-lg border border-[#2a3040] bg-[#151923] p-8 text-white">
          <h1 className="text-2xl font-bold mb-2">403 — Acesso restrito</h1>
          <p className="text-sm text-white/80 mb-6">
            Acesso restrito — mas não se preocupe: o projeto é gratuito e você pode acessar todas as funcionalidades na página principal.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-sm"
          >
            Ir para Início
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default InviteGate
