"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Car, Globe, DollarSign } from "lucide-react"

export function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative pt-16 lg:pt-18">
      {/* Hero Image Background */}
      <div className="relative h-[420px] sm:h-[480px] lg:h-[550px]">
        <img
          src="/cars/2024 TOYOTA LANDCRUISER ZX/Front.jpeg"
          alt="Premium car showcase"
          className="absolute inset-0 w-full h-full object-cover"
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
            </div>
          </div>
        </div>
      </div>

      {/* Search Box - Positioned to overlap hero */}
      <div className="relative -mt-32 sm:-mt-24 lg:-mt-16 z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-6 border border-border animate-scale-in" style={{ animationDelay: "0.4s", opacity: 0, animationFillMode: "forwards" }}>
            {/* 2x2 Grid for form fields on mobile, 4 columns on desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Make */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-foreground">Make</label>
                <Select>
                  <SelectTrigger className="h-12 sm:h-11 bg-muted/50 border-border rounded-xl">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder="Make" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="toyota">Toyota</SelectItem>
                    <SelectItem value="ford">Ford</SelectItem>
                    <SelectItem value="range-rover">Range Rover</SelectItem>
                    <SelectItem value="subaru">Subaru</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Model */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-foreground">Model</label>
                <Select>
                  <SelectTrigger className="h-12 sm:h-11 bg-muted/50 border-border rounded-xl">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder="Model" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="land-cruiser">Land Cruiser</SelectItem>
                    <SelectItem value="ranger">Ranger</SelectItem>
                    <SelectItem value="fortuner">Fortuner</SelectItem>
                    <SelectItem value="forester">Forester</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-foreground">Price Range</label>
                <Select>
                  <SelectTrigger className="h-12 sm:h-11 bg-muted/50 border-border rounded-xl">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder="$15000" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-25000">$0 - $25,000</SelectItem>
                    <SelectItem value="25000-50000">$25,000 - $50,000</SelectItem>
                    <SelectItem value="50000-100000">$50,000 - $100,000</SelectItem>
                    <SelectItem value="100000+">$100,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Zip Code / Location */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-foreground">Zip Code</label>
                <Select>
                  <SelectTrigger className="h-12 sm:h-11 bg-muted/50 border-border rounded-xl">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder="9440" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9440">9440</SelectItem>
                    <SelectItem value="11101">11101</SelectItem>
                    <SelectItem value="12345">12345</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Filter Actions - stacked on mobile */}
            <div className="mt-4 sm:mt-5 flex flex-col gap-4">
              {/* Filter pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-sm font-medium text-foreground shrink-0">Filter:</span>
                <Button variant="outline" size="sm" className="rounded-full text-xs h-9 px-4 border-border text-foreground hover:bg-muted bg-transparent whitespace-nowrap">
                  Advance Search
                </Button>
                <Button variant="outline" size="sm" className="rounded-full text-xs h-9 px-4 border-border text-foreground hover:bg-muted bg-transparent whitespace-nowrap">
                  Compare Cars
                </Button>
              </div>

              {/* Search Button - full width on mobile */}
              <Button 
                onClick={() => scrollToSection("popular")}
                className="w-full lg:w-auto lg:ml-auto bg-primary text-primary-foreground hover:bg-primary/90 h-12 sm:h-11 px-8 rounded-full text-base font-medium"
              >
                <Search className="w-4 h-4 mr-2" />
                Search Your Car
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Spacer */}
      <div className="h-8 sm:h-12" />
    </section>
  )
}
