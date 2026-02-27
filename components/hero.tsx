"use client"

interface HeroProps {
  heroImage?: string
}

export function Hero({ heroImage = "/placeholder.svg" }: HeroProps) {
  return (
    <section className="relative">
      {/* Hero Image Background */}
      <div className="relative h-[500px] sm:h-[600px] lg:h-[700px] xl:h-[750px]">
        <img
          src={heroImage}
          alt="Premium car showcase"
          className="absolute inset-0 w-full h-full object-cover bg-muted"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            (e.target as HTMLImageElement).src = "/placeholder.svg"
          }}
        />
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
                Search new, used, and certified cars near you.
              </p>
              
              {/* Shop Now Button */}
              <div className="mt-8 animate-fade-in-up" style={{ animationDelay: "0.4s", opacity: 0, animationFillMode: "forwards" }}>
                <a href="/shop">
                  <button className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-primary/90 overflow-hidden">
                    <span className="relative z-10">Shop Now</span>
                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
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
