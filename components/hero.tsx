"use client"

import { useEffect, useState } from "react"

const HERO_SLIDES = ["/images/img-1.jpg", "/images/img-2.jpg", "/images/img-3.jpg", "/images/img-4.jpg", "/images/img-5.jpg"] as const
const SLIDE_MS = 4500

export function Hero() {
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setActiveSlide((idx) => (idx + 1) % HERO_SLIDES.length)
    }, SLIDE_MS)
    return () => window.clearInterval(timerId)
  }, [])

  return (
    <section id="home" className="relative scroll-mt-20 lg:scroll-mt-24">
      {/* Hero slideshow background */}
      <div className="relative h-screen overflow-hidden">
        {HERO_SLIDES.map((imageSrc, idx) => (
          <img
            key={imageSrc}
            src={imageSrc}
            alt="Premium car showcase"
            className={`absolute inset-0 h-full w-full object-cover bg-muted scale-x-[-1] transition-opacity duration-1000 ${
              idx === activeSlide ? "opacity-100" : "opacity-0"
            }`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg"
            }}
          />
        ))}
        {/* Overlay - centered gradient for mobile, left-aligned for desktop */}
        <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-foreground/60 via-foreground/40 to-foreground/20 sm:to-transparent" />
        
        {/* Hero Content - centered on mobile, left-aligned on desktop */}
        <div className="absolute inset-0 flex items-center justify-center sm:justify-start">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight animate-fade-in-up">
                Find your perfect car.
              </h1>
              <p className="mt-3 text-base sm:text-lg text-white/80 animate-fade-in-up" style={{ animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}>
                TG World Import & Export Ltd — bringing you premium vehicles from across the globe, straight to your door.
              </p>
              
              {/* CTAs */}
              <div
                className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 animate-fade-in-up"
                style={{ animationDelay: "0.4s", opacity: 0, animationFillMode: "forwards" }}
              >
                <a href="/shop">
                  <button className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-primary/90 overflow-hidden w-full sm:w-auto">
                    <span className="relative z-10">Shop Now</span>
                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </button>
                </a>
                <a href="/find-your-car">
                  <button className="group relative px-8 py-4 bg-white/15 backdrop-blur-sm text-white border-2 border-white/40 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/25 overflow-hidden w-full sm:w-auto">
                    <span className="relative z-10">Find your car</span>
                    <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
