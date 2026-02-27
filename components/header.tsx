"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface HeaderProps {
  logoLight?: string
  logoDark?: string
}

export function Header({ logoLight = "/placeholder-logo.svg", logoDark = "/placeholder-logo.svg" }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsMenuOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-sm"
          : "bg-transparent shadow-none backdrop-blur-none"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <a href="/" className="relative h-10 w-32 sm:h-12 sm:w-40 cursor-pointer">
              <Image
                src={logoLight}
                alt="TG World"
                fill
                className="object-contain"
                priority
                unoptimized={logoLight?.startsWith('http')}
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  (e.target as HTMLImageElement).src = "/placeholder-logo.svg"
                }}
              />
            </a>
          </div>

          {/* Sign In Button */}
          <div className="hidden md:flex items-center">
            <Button 
              variant="outline"
              onClick={() => router.push("/signin")}
              className="rounded-full px-6 border-transparent bg-transparent text-white font-bold hover:bg-white hover:text-black hover:border-white"
            >
              Sign In
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <Button 
                variant="outline"
                onClick={() => {
                  router.push("/signin")
                  setIsMenuOpen(false)
                }}
                className="w-full rounded-full border-border text-foreground"
              >
                Sign In
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
