"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Car } from "lucide-react"

export function Header() {
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
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-foreground">TG World</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection("popular")}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Buy
            </button>
            <button 
              onClick={() => scrollToSection("coming-soon")}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Sell
            </button>
            <button 
              onClick={() => scrollToSection("features")}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Finance
            </button>
            <button 
              onClick={() => scrollToSection("contact")}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Reviews
            </button>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button 
              onClick={() => scrollToSection("contact")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5"
            >
              Post Your Add
            </Button>
            <Button 
              variant="outline"
              onClick={() => scrollToSection("contact")}
              className="rounded-full px-5 border-border text-foreground hover:bg-muted"
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
              <button 
                onClick={() => scrollToSection("popular")}
                className="text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Buy
              </button>
              <button 
                onClick={() => scrollToSection("coming-soon")}
                className="text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Sell
              </button>
              <button 
                onClick={() => scrollToSection("features")}
                className="text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Finance
              </button>
              <button 
                onClick={() => scrollToSection("contact")}
                className="text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Reviews
              </button>
              <div className="flex gap-3 mt-2">
                <Button 
                  onClick={() => scrollToSection("contact")}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
                >
                  Post Your Add
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => scrollToSection("contact")}
                  className="flex-1 rounded-full border-border text-foreground"
                >
                  Sign In
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
