"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

const SPLASH_SHOWN_KEY = "tgworld_splash_shown"
// How long the logo is fully visible before starting to fade
const HOLD_MS = 1800
// Duration of the fade-out animation
const FADE_MS = 600

export function SplashScreen() {
  // null = not yet determined, true = visible, false = done (unmounted)
  const [phase, setPhase] = useState<"visible" | "fading" | "done">("visible")

  useEffect(() => {
    // Only show once per browser session
    if (sessionStorage.getItem(SPLASH_SHOWN_KEY)) {
      setPhase("done")
      return
    }
    sessionStorage.setItem(SPLASH_SHOWN_KEY, "1")

    // Hold → then fade → then unmount
    const holdTimer = setTimeout(() => setPhase("fading"), HOLD_MS)
    const doneTimer = setTimeout(() => setPhase("done"), HOLD_MS + FADE_MS)
    return () => {
      clearTimeout(holdTimer)
      clearTimeout(doneTimer)
    }
  }, [])

  if (phase === "done") return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
      style={{
        transition: `opacity ${FADE_MS}ms ease-out`,
        opacity: phase === "fading" ? 0 : 1,
        pointerEvents: phase === "fading" ? "none" : "auto",
      }}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-6 px-8">
        <div className="relative w-64 h-44 sm:w-80 sm:h-56">
          <Image
            src="/tg-world_dark_logo.jpg"
            alt="TG World International"
            fill
            className="object-contain"
            priority
            unoptimized
          />
        </div>
        {/* Subtle pulsing loading bar */}
        <div className="w-40 h-0.5 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#FF6A00]"
            style={{
              animation: `splash-progress ${HOLD_MS}ms ease-out forwards`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
