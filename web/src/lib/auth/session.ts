const SESSION_KEY = 'marketplace_session'

export interface StoredSession {
  actorType: 'admin' | 'seller' | 'buyer'
  userId: string
}

export function getStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredSession
  } catch {
    return null
  }
}

export function setStoredSession(session: StoredSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearStoredSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function getTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark' || stored === 'light') return stored
  return 'light'
}

export function setTheme(theme: 'light' | 'dark'): void {
  localStorage.setItem('theme', theme)
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function initTheme(): void {
  setTheme(getTheme())
}

const SIDEBAR_COLLAPSED_KEY = 'sidebar_collapsed'

export function getSidebarCollapsed(): boolean {
  return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
}

export function setSidebarCollapsed(collapsed: boolean): void {
  localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed))
}
