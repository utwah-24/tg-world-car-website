"use client"

import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { favoritesApi, FavoritesApiError } from "@/lib/favorites-api"

type FavoritesContextValue = {
  favoriteIds: number[]
  isLoading: boolean
  isFavorite: (carId: string | number) => boolean
  isPending: (carId: string | number) => boolean
  toggleFavorite: (carId: string | number) => Promise<boolean>
  refreshFavorites: () => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

function numericCarId(value: string | number) {
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authIsLoading, clearAuthenticatedUser } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set())
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  const refreshFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteIds(new Set())
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      const response = await favoritesApi.list()
      setFavoriteIds(new Set(response.data.map((item) => Number(item.carId)).filter(Number.isSafeInteger)))
    } catch (error) {
      if (error instanceof FavoritesApiError && error.status === 401) clearAuthenticatedUser()
      setFavoriteIds(new Set())
    } finally {
      setIsLoading(false)
    }
  }, [user, clearAuthenticatedUser])

  useEffect(() => {
    if (!authIsLoading) void refreshFavorites()
  }, [authIsLoading, refreshFavorites])

  useEffect(() => {
    const onFocus = () => {
      if (user) void refreshFavorites()
    }
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [user, refreshFavorites])

  const toggleFavorite = useCallback(async (value: string | number) => {
    const carId = numericCarId(value)
    if (!user || !carId) throw new FavoritesApiError("VALIDATION_FAILED", "A valid car is required.", {}, 422)
    if (pendingIds.has(carId)) return favoriteIds.has(carId)

    const wasFavorite = favoriteIds.has(carId)
    setFavoriteIds((current) => {
      const next = new Set(current)
      if (wasFavorite) next.delete(carId)
      else next.add(carId)
      return next
    })
    setPendingIds((current) => new Set(current).add(carId))

    try {
      if (wasFavorite) await favoritesApi.remove(carId)
      else await favoritesApi.add(carId)
      return !wasFavorite
    } catch (error) {
      setFavoriteIds((current) => {
        const next = new Set(current)
        if (wasFavorite) next.add(carId)
        else next.delete(carId)
        return next
      })
      if (error instanceof FavoritesApiError && error.status === 401) clearAuthenticatedUser()
      throw error
    } finally {
      setPendingIds((current) => {
        const next = new Set(current)
        next.delete(carId)
        return next
      })
    }
  }, [user, pendingIds, favoriteIds, clearAuthenticatedUser])

  const value = useMemo<FavoritesContextValue>(() => ({
    favoriteIds: [...favoriteIds],
    isLoading,
    isFavorite: (value) => {
      const id = numericCarId(value)
      return id !== null && favoriteIds.has(id)
    },
    isPending: (value) => {
      const id = numericCarId(value)
      return id !== null && pendingIds.has(id)
    },
    toggleFavorite,
    refreshFavorites,
  }), [favoriteIds, pendingIds, isLoading, toggleFavorite, refreshFavorites])

  return createElement(FavoritesContext.Provider, { value }, children)
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) throw new Error("useFavorites must be used inside FavoritesProvider")
  return context
}
