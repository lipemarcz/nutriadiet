export type InviteScope = 'BMTEAM'

export interface CurrentUser {
  id: string
  email: string
}

const LS_USER_KEY = 'auth:user'
const LS_INVITE_ACCEPTED = 'bmteam:inviteAccepted'
const LS_SCOPE_PREFIX = 'bmteam:scope:'

export function getCurrentUser(): CurrentUser | null {
  try {
    const raw = localStorage.getItem(LS_USER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { id?: string; email?: string }
    if (parsed && typeof parsed.id === 'string' && typeof parsed.email === 'string') {
      return { id: parsed.id, email: parsed.email }
    }
    return null
  } catch {
    return null
  }
}

export function hasAcceptedInviteFor(scope: InviteScope): boolean {
  try {
    const accepted = localStorage.getItem(LS_INVITE_ACCEPTED) === '1'
    const scopeKey = `${LS_SCOPE_PREFIX}${scope}`
    const inScope = localStorage.getItem(scopeKey) === '1'
    return accepted && inScope
  } catch {
    return false
  }
}

export function acceptInviteToken(token: string, scope: InviteScope): void {
  // Fallback-only persistence using localStorage. Token value is not stored for security.
  try {
    if (!token || token.trim().length === 0) return
    localStorage.setItem(LS_INVITE_ACCEPTED, '1')
    localStorage.setItem(`${LS_SCOPE_PREFIX}${scope}`, '1')
    // Optional: mark timestamp for debugging
    localStorage.setItem('bmteam:inviteAcceptedAt', String(Date.now()))
  } catch {
    // ignore
  }
}

export function clearInvite(scope: InviteScope): void {
  try {
    localStorage.removeItem(LS_INVITE_ACCEPTED)
    localStorage.removeItem(`${LS_SCOPE_PREFIX}${scope}`)
  } catch {
    // ignore
  }
}

