"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface AutoRefreshOnFocusProps {
  /** Optional poll interval in ms (e.g. 5–10 min on the Coming Soon page to match the backend cron). */
  pollIntervalMs?: number
}

/**
 * Cars can flip between Coming Soon and Latest on the backend at any moment
 * (cron runs every 5 minutes, and every `/api/cars` read also clears expired
 * coming-soon cars). Since these pages are server-rendered per request, this
 * component re-runs the server fetch via `router.refresh()` when the tab
 * regains focus — and optionally on an interval — so the UI stays in sync
 * without relying on any client-side "move on date" logic.
 */
export function AutoRefreshOnFocus({ pollIntervalMs }: AutoRefreshOnFocusProps) {
  const router = useRouter()

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") router.refresh()
    }
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("focus", onVisible)
    return () => {
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("focus", onVisible)
    }
  }, [router])

  useEffect(() => {
    if (!pollIntervalMs) return
    const id = window.setInterval(() => router.refresh(), pollIntervalMs)
    return () => window.clearInterval(id)
  }, [pollIntervalMs, router])

  return null
}
