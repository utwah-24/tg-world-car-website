"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Image from "next/image"

interface HeaderProps {
  logoLight?: string
  logoDark?: string
}

export function Header({ logoLight = "/placeholder-logo.svg", logoDark = "/placeholder-logo.svg" }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsMenuOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative h-10 w-32 sm:h-12 sm:w-40">
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
            </div>
          </div>

          {/* Sign In Button */}
          <div className="hidden md:flex items-center">
            <Button 
              variant="outline"
              onClick={() => scrollToSection("contact")}
              className="rounded-full px-6 border-border text-foreground hover:bg-muted"
            >
              Sign In
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
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
                  scrollToSection("contact")
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
