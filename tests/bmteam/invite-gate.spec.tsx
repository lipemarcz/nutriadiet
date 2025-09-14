import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../../src/contexts/AuthContext'
import InviteGate from '../../src/components/bmteam/InviteGate'

function withProviders(ui: React.ReactElement, initialEntries: string[] = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={ui} />
          <Route path="/restrito" element={ui} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

const mockFetchUser = () => {
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    if (typeof input === 'string' && input.endsWith('/api/me')) {
      return {
        ok: true,
        json: async () => ({ id: 'u1', email: 'user@test.com', papel: 'colaborador' }),
      } as Response
    }
    return { ok: true, json: async () => ({}) } as Response
  }))
}

describe('InviteGate', () => {
  it('renders children when logged in and invite accepted', async () => {
    mockFetchUser()
    localStorage.setItem('bmteam:inviteAccepted', '1')
    localStorage.setItem('bmteam:scope:BMTEAM', '1')
    const Child = () => <div data-testid="allowed">OK</div>
    withProviders(
      <InviteGate>
        <Child />
      </InviteGate>,
      ['/restrito']
    )
    await waitFor(() => expect(screen.getByTestId('allowed')).toBeInTheDocument())
  })

  it('shows 403 when logged in but invite not accepted', async () => {
    mockFetchUser()
    withProviders(
      <InviteGate>
        <div>inside</div>
      </InviteGate>,
      ['/restrito']
    )
    await waitFor(() => expect(screen.getByText(/403/i)).toBeInTheDocument())
  })

  it('accepts invite via query param and allows access', async () => {
    mockFetchUser()
    const Child = () => <div data-testid="allowed">OK</div>
    withProviders(
      <InviteGate>
        <Child />
      </InviteGate>,
      ['/restrito?invite=ABC123']
    )
    await waitFor(() => expect(screen.getByTestId('allowed')).toBeInTheDocument())
    expect(localStorage.getItem('bmteam:inviteAccepted')).toBe('1')
    expect(localStorage.getItem('bmteam:scope:BMTEAM')).toBe('1')
  })
})
