import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface UserHeaderProps {
  className?: string
  onAdminClick?: () => void
}

export function UserHeader({ className = '', onAdminClick }: UserHeaderProps) {
  const { user, signOut, loading } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-gray-900">Macros V2</h1>
      </div>
      
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-3 py-2"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
            {user.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="hidden sm:block text-sm font-medium">
            {user.email}
          </span>
          <svg 
            className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
            <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
              <p className="font-medium">Logado como</p>
              <p className="text-gray-500 truncate">{user.email}</p>
              <p className="text-xs text-blue-600 font-medium">Área interna</p>
            </div>
            
            <div className="py-1">
              {onAdminClick && (
                <button
                  onClick={() => {
                    setShowDropdown(false)
                    onAdminClick()
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Admin
                </button>
              )}
              
              <button
                onClick={() => {
                  setShowDropdown(false)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Perfil
              </button>
              
              <button
                onClick={() => {
                  setShowDropdown(false)
                  handleSignOut()
                }}
                disabled={loading}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saindo...' : 'Sair'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}