"use client"

import React, { useId } from "react"
import { cn } from "@/lib/utils"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

/** Add URLs when ready; empty string renders a non-clickable card until then. */
export const CONNECT_SOCIAL_HREFS = {
  instagram: "",
  facebook: "",
  youtube: "",
} as const

type PlatformId = keyof typeof CONNECT_SOCIAL_HREFS

function SocialCard({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: React.ReactNode
}) {
  const styles = cn(
    "flex items-center gap-4 rounded-[1.75rem] p-5 sm:p-6 text-left transition-all duration-200",
    "border border-black/[0.04] shadow-sm",
    href
      ? "hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      : "cursor-default opacity-95",
    className,
  )

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles}
      >
        {children}
      </a>
    )
  }

  return <div className={styles}>{children}</div>
}

function IconInstagram({ className }: { className?: string }) {
  const gid = useId().replace(/:/g, "")
  return (
    <svg className={className} viewBox="0 0 24 24" width={40} height={40} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gid})`}
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
      />
    </svg>
  )
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={40} height={40} aria-hidden>
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        fill="white"
        d="M13.9 19v-6.2h2.1l.3-2.4h-2.4V9.2c0-.7.2-1.2 1.3-1.2h1.3V6.1c-.6-.1-1.3-.2-2-.2-2 0-3.4 1.2-3.4 3.5v2h-2.3v2.4h2.3V19h2.8z"
      />
    </svg>
  )
}

function IconYouTube({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={40} height={40} aria-hidden>
      <path fill="#FF0000" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.7 31.7 0 0 0 0 12a31.7 31.7 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1 31.7 31.7 0 0 0 .5-5.8 31.7 31.7 0 0 0-.5-5.8z" />
      <path fill="#fff" d="M9.8 15.5V8.5L15.6 12l-5.8 3.5z" />
    </svg>
  )
}

const CARDS: {
  id: PlatformId
  title: string
  subtitle: string
  bg: string
  Icon: React.ComponentType<{ className?: string }>
}[] = [
  {
    id: "instagram",
    title: "TG World",
    subtitle: "Follow us on Instagram",
    bg: "bg-[#fdf2f8] dark:bg-pink-950/30",
    Icon: IconInstagram,
  },
  {
    id: "facebook",
    title: "TG World",
    subtitle: "Follow us on Facebook",
    bg: "bg-[#eff6ff] dark:bg-blue-950/30",
    Icon: IconFacebook,
  },
  {
    id: "youtube",
    title: "TG World",
    subtitle: "Watch our latest videos",
    bg: "bg-[#fef2f2] dark:bg-red-950/25",
    Icon: IconYouTube,
  },
]

export function ConnectWithUsSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 })
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation({ threshold: 0.08 })

  return (
    <section
      id="connect"
      className="py-12 lg:py-20 bg-background scroll-mt-20 lg:scroll-mt-24 border-t border-border/60"
      aria-labelledby="connect-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={headerRef}
          className={cn(
            "mb-10 lg:mb-12 text-left transition-all duration-700 ease-out",
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          <h2
            id="connect-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground"
          >
            Connect with us
          </h2>
        </div>

        <div
          ref={gridRef}
          className={cn(
            "grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 transition-all duration-700 ease-out delay-100",
            gridVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          {CARDS.map(({ id, title, subtitle, bg, Icon }) => {
            const href = CONNECT_SOCIAL_HREFS[id]
            return (
              <SocialCard key={id} href={href} className={bg}>
                <div className="shrink-0 flex items-center justify-center" aria-hidden>
                  <Icon />
                </div>
                <div className="min-w-0 flex flex-col gap-0.5">
                  <span className="font-bold text-foreground text-base sm:text-lg leading-tight">
                    {title}
                  </span>
                  <span className="text-sm sm:text-[0.9375rem] text-foreground/75 leading-snug">
                    {subtitle}
                  </span>
                </div>
              </SocialCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
