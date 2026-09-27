import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, postJson } from './api'

export type User = { id: number; username: string }

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore the session from the cookie on page load
  useEffect(() => {
    api<User | null>('/api/auth/me')
      .then(setUser)
      .catch((err) => console.error('Failed to load session', err))
      .finally(() => setLoading(false))
  }, [])

  const value: AuthContextValue = {
    user,
    loading,
    login: async (username, password) =>
      setUser(await postJson<User>('/api/auth/login', { username, password })),
    register: async (username, password) =>
      setUser(await postJson<User>('/api/auth/register', { username, password })),
    logout: async () => {
      await api('/api/auth/logout', { method: 'POST' })
      setUser(null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}