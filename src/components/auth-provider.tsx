'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

type AuthState = {
  hash: string | null
  isLoggedIn: boolean
  initialized: boolean
  login: (hash: string) => void
  signup: (hash: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

const AUTH_HASH_KEY = 'jointsettle-auth-hash'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [hash, setHash] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const storedHash = localStorage.getItem(AUTH_HASH_KEY)
    if (storedHash) {
      setHash(storedHash)
    }
    setInitialized(true)
  }, [])

  const login = useCallback((newHash: string) => {
    localStorage.setItem(AUTH_HASH_KEY, newHash)
    setHash(newHash)
  }, [])

  const signup = useCallback((newHash: string) => {
    localStorage.setItem(AUTH_HASH_KEY, newHash)
    setHash(newHash)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_HASH_KEY)
    setHash(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        hash,
        isLoggedIn: initialized && hash !== null,
        initialized,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
