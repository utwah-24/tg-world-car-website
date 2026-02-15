"use client"

import { Phone, Mail, MapPin, Clock } from "lucide-react"
import Image from "next/image"

interface FooterProps {
  logoLight?: string
}

export function Footer({ logoLight = "/placeholder-logo.svg" }: FooterProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="relative h-10 w-32 mb-4">
              <Image
                src={logoLight}
                alt="TG World"
                fill
                className="object-contain object-left brightness-0 invert"
                unoptimized={logoLight?.startsWith('http')}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-logo.svg"
                }}
              />
            </div>
            <p className="text-background/70 text-sm leading-relaxed">
              Your trusted partner in finding the perfect vehicle. Premium quality, exceptional service.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-background">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => scrollToSection("popular")}
                  className="text-sm text-background/70 hover:text-primary transition-colors"
                >
                  Popular Cars
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("coming-soon")}
                  className="text-sm text-background/70 hover:text-primary transition-colors"
                >
                  Coming Soon
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("top-picks")}
                  className="text-sm text-background/70 hover:text-primary transition-colors"
                >
                  Top Picks
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("contact")}
                  className="text-sm text-background/70 hover:text-primary transition-colors"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4 text-background">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-background/70">
                <Phone className="w-4 h-4 shrink-0" />
                <span>+255 123 456 789</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-background/70">
                <Mail className="w-4 h-4 shrink-0" />
                <span>info@tgworld.com</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-background/70">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Dar es Salaam, Tanzania</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-semibold mb-4 text-background">Business Hours</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-background/70">
                <Clock className="w-4 h-4 shrink-0" />
                <div>
                  <span className="block">Mon - Fri: 8AM - 6PM</span>
                  <span className="block">Sat: 9AM - 4PM</span>
                  <span className="block">Sun: Closed</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-background/20">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-background/50">
              © {new Date().getFullYear()} TG World. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <button className="text-sm text-background/50 hover:text-primary transition-colors">
                Privacy Policy
              </button>
              <button className="text-sm text-background/50 hover:text-primary transition-colors">
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
