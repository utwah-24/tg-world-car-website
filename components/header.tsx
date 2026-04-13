"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, ChevronDown } from "lucide-react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface HeaderProps {
  logoLight?: string
  logoDark?: string
}

const navBtnClass =
  "text-sm font-medium rounded-md px-2 py-1.5 transition-colors outline-none text-black hover:text-neutral-900 hover:bg-muted"

const dropdownTriggerClass =
  "inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors outline-none text-black hover:bg-muted data-[state=open]:bg-muted data-[state=open]:text-black"

export function Header({ logoLight = "/placeholder-logo.svg", logoDark = "/placeholder-logo.svg" }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [isMenuOpen])

  /** Scroll to section on home, or navigate to `/#id` from other routes */
  const goToSection = (sectionId: string) => {
    setIsMenuOpen(false)
    const scroll = () => {
      const el = document.getElementById(sectionId)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    if (pathname === "/") {
      scroll()
    } else {
      window.location.assign(`/#${sectionId}`)
    }
  }

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <>
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-white shadow-sm" : "bg-transparent shadow-none backdrop-blur-none"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18 gap-4 w-full min-w-0">
          {/* Logo — left */}
          <div className="flex items-center gap-2 shrink-0 min-w-0">
            <a href="/" className="relative h-10 w-32 sm:h-12 sm:w-40 cursor-pointer">
              <Image
                src={logoLight}
                alt="TG World"
                fill
                className="object-contain"
                priority
                unoptimized={logoLight?.startsWith("http")}
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = "/placeholder-logo.svg"
                }}
              />
            </a>
          </div>

          {/* Nav + Sign In + menu — right (same cluster as Sign In) */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 ml-auto shrink-0">
            <nav className="hidden lg:flex items-center justify-end gap-1 xl:gap-2">
              <button type="button" onClick={() => goToSection("home")} className={navBtnClass}>
                Home
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger className={dropdownTriggerClass}>
                  Cars
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-[60] min-w-[12rem]">
                  <DropdownMenuItem onClick={() => goToSection("latest")}>Latest</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => goToSection("popular")}>Popular</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => goToSection("top-picks")}>Top Picks for you</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <button type="button" onClick={() => goToSection("content")} className={navBtnClass}>
                Content
              </button>

              <button type="button" onClick={() => goToSection("contact")} className={navBtnClass}>
                Get in touch
              </button>
            </nav>

            <Button
              variant="outline"
              onClick={() => router.push("/signin")}
              className="hidden md:inline-flex rounded-full border-black/25 bg-transparent px-6 font-bold h-10 text-black hover:bg-muted hover:text-black"
            >
              Sign In
            </Button>

            <button
              type="button"
              className="lg:hidden p-2 shrink-0 text-black"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>

    {/* Fullscreen mobile / tablet menu — blur + subtle motion */}
    {isMenuOpen && (
      <div
        className="fixed inset-0 z-[100] lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
      >
        <div
          className="absolute inset-0 z-0 bg-black/45 backdrop-blur-md animate-in fade-in duration-300 ease-out"
          aria-hidden
        />
        <div
          className="relative z-[1] flex min-h-[100dvh] flex-col animate-in fade-in slide-in-from-top-3 duration-300 ease-out"
        >
          <div
            className={cn(
              "flex items-center justify-between px-5 sm:px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-4",
              "border-b border-white/10 bg-black/25 backdrop-blur-sm"
            )}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Menu</span>
            <button
              type="button"
              onClick={closeMenu}
              className="rounded-full p-2.5 text-white hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto overscroll-contain px-5 sm:px-6 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => goToSection("home")}
              className="text-left py-3.5 text-lg font-medium text-white rounded-xl hover:bg-white/10 transition-colors px-1"
            >
              Home
            </button>
            <p className="px-1 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-widest text-white/45">
              Cars
            </p>
            <button
              type="button"
              onClick={() => goToSection("latest")}
              className="text-left pl-4 py-3 text-base text-white/95 rounded-xl hover:bg-white/10 transition-colors"
            >
              Latest
            </button>
            <button
              type="button"
              onClick={() => goToSection("popular")}
              className="text-left pl-4 py-3 text-base text-white/95 rounded-xl hover:bg-white/10 transition-colors"
            >
              Popular
            </button>
            <button
              type="button"
              onClick={() => goToSection("top-picks")}
              className="text-left pl-4 py-3 text-base text-white/95 rounded-xl hover:bg-white/10 transition-colors"
            >
              Top Picks for you
            </button>
            <button
              type="button"
              onClick={() => goToSection("content")}
              className="text-left py-3.5 text-lg font-medium text-white rounded-xl hover:bg-white/10 transition-colors px-1 mt-2"
            >
              Content
            </button>
            <button
              type="button"
              onClick={() => goToSection("contact")}
              className="text-left py-3.5 text-lg font-medium text-white rounded-xl hover:bg-white/10 transition-colors px-1"
            >
              Get in touch
            </button>

            <div className="mt-auto pt-8 border-t border-white/10">
              <Button
                variant="outline"
                onClick={() => {
                  router.push("/signin")
                  closeMenu()
                }}
                className="w-full rounded-full bg-transparent border-white/30 text-white hover:bg-white/15 hover:text-white"
              >
                Sign In
              </Button>
            </div>
          </nav>
        </div>
      </div>
    )}
    </>
  )
}
