import React from 'react'
import { LoginForm } from './LoginForm'

export default function CadastroPage() {
  return (
    <div className="min-h-[70vh] flex items-start justify-center py-10">
      <div className="w-full max-w-lg">
        <LoginForm isRegisterMode={true} onToggleMode={() => {}} />
      </div>
    </div>
  )
}


