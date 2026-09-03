"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { authApi, AuthApiError, type AuthUser } from "@/lib/auth-api"

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  setAuthenticatedUser: (user: AuthUser) => void
  clearAuthenticatedUser: () => void
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.me()
      setUser(response.user)
    } catch (error) {
      if (error instanceof AuthApiError && error.status !== 401) {
        console.error("Unable to refresh authentication state", error)
      }
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshUser()
  }, [refreshUser])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
      setIsLoading(false)
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    isAuthenticated: user !== null,
    setAuthenticatedUser: (nextUser) => {
      setUser(nextUser)
      setIsLoading(false)
    },
    clearAuthenticatedUser: () => {
      setUser(null)
      setIsLoading(false)
    },
    refreshUser,
    logout,
  }), [user, isLoading, refreshUser, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider")
  return context
}
