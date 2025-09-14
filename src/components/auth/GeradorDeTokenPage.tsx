import React from 'react'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminPanel } from './AdminPanel'

export default function GeradorDeTokenPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-[70vh] py-8">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-4">Gerador de Token</h1>
          <AdminPanel onClose={() => {}} />
        </div>
      </div>
    </ProtectedRoute>
  )
}


