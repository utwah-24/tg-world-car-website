"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Fuel, Gauge, MapPin, Calendar, Star, Car } from "lucide-react"
import type { Car as CarType } from "@/lib/cars-data"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

interface CarCardProps {
  car: CarType
  showBadge?: boolean
  badgeText?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  delay?: number
}

export function CarCard({ car, showBadge, badgeText, badgeVariant = "default", delay = 0 }: CarCardProps) {
  const isSoldOut = car.category === "sold-out"
  const isComingSoon = car.category === "coming-soon"
  const isThirdParty = car.description?.includes('[THIRD_PARTY]') || false
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })
  
  // Check if this car's image should be flipped
  const carNameUpper = car.name.toUpperCase()
  const shouldFlipImage = carNameUpper.includes('FORD RANGER WILDTRACK') || 
                          carNameUpper.includes('SCANIA DUMP TRUCK') ||
                          (carNameUpper.includes('SCANIA') && carNameUpper.includes('94C'))

  // Generate a clean summary from the description
  const getCleanSummary = (description: string): string => {
    if (!description) return ''
    
    // Remove [THIRD_PARTY] marker
    let clean = description.replace('[THIRD_PARTY] ', '')
    
    // Extract key details that aren't already shown in specs
    const engineMatch = clean.match(/Engine Size\s*:\s*([^\n]+)/i)
    const driveMatch = clean.match(/Drive\s*:\s*(AWD|4WD|FWD|RWD)/i)
    const seatsMatch = clean.match(/Seat Capacity\s*:\s*(\d+)/i)
    const colorMatch = clean.match(/Color\s*:\s*([^\n]+)/i)
    
    const details = []
    if (engineMatch) details.push(engineMatch[1].trim().split(' ')[0]) // Just the size like "3,000cc"
    if (driveMatch) details.push(driveMatch[1])
    if (seatsMatch) details.push(`${seatsMatch[1]} Seats`)
    if (colorMatch && !colorMatch[1].includes('Price') && !colorMatch[1].includes('Engine')) {
      details.push(colorMatch[1].trim().split('\n')[0])
    }
    
    // If we have details, format them nicely
    if (details.length > 0) {
      return details.slice(0, 3).join(' • ')
    }
    
    // Otherwise, try to get a clean first line without repetitive info
    const lines = clean.split('\n').filter(line => 
      !line.includes('Price :') && 
      !line.includes('Transmission :') && 
      !line.includes('Fuel :') && 
      !line.includes('Mileage :') &&
      !line.includes('Location :') &&
      line.trim().length > 0
    )
    
    return lines[0] ? lines[0].trim().substring(0, 80) : ''
  }

  const cleanSummary = car.description ? getCleanSummary(car.description) : ''

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <Card className={`group overflow-hidden border-border bg-card hover:shadow-xl transition-all duration-300 rounded-2xl ${isSoldOut ? "opacity-80" : ""}`}>
      {/* Image Container */}
      <div className="relative aspect-[4/3] sm:aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={car.image || "/placeholder.svg"}
          alt={`${car.year} ${car.name}`}
          fill
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isSoldOut ? "grayscale" : ""}`}
          style={shouldFlipImage ? { transform: 'scaleX(-1)' } : undefined}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized={car.image?.startsWith('http')}
        />
        
        {/* Location & Rating Badge */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-wrap gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1 sm:gap-1.5 bg-foreground/80 backdrop-blur-sm text-white text-[10px] sm:text-xs px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-full">
            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">Dar es Salaam</span>
            <span className="sm:hidden">DSM</span>
          </div>
        </div>
        
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          <div className="flex items-center gap-0.5 sm:gap-1 bg-foreground/80 backdrop-blur-sm text-white text-[10px] sm:text-xs px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-full">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
            <span>4.8</span>
          </div>
        </div>

        {/* Status Badges */}
        {(isSoldOut || isComingSoon || isThirdParty || (showBadge && badgeText)) && (
          <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 flex gap-2">
            {/* Third Party Badge - Always show if it's third party */}
            {isThirdParty && (
              <Badge className="text-[10px] sm:text-xs font-medium bg-purple-600 text-white px-2 py-0.5 sm:px-2.5 sm:py-1">
                Third Party
              </Badge>
            )}
            
            {/* Other badges */}
            {showBadge && badgeText && !isSoldOut && !isComingSoon && (
              <Badge variant={badgeVariant} className="text-[10px] sm:text-xs font-medium bg-primary text-primary-foreground px-2 py-0.5 sm:px-2.5 sm:py-1">
                {badgeText}
              </Badge>
            )}
            {isSoldOut && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs font-medium bg-foreground/90 text-white px-2 py-0.5 sm:px-2.5 sm:py-1">
                Sold
              </Badge>
            )}
            {isComingSoon && !isThirdParty && (
              <Badge className="text-[10px] sm:text-xs font-medium bg-primary text-primary-foreground px-2 py-0.5 sm:px-2.5 sm:py-1">
                Coming Soon
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-3 sm:p-4">
        {/* Car Name */}
        <div className="mb-2 sm:mb-3">
          <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-1 truncate">
            {car.year} {car.name}
          </h3>
        </div>

        {/* Price */}
        <div className="mb-2">
          <span className="text-base sm:text-xl font-bold text-foreground leading-tight block">{car.price}</span>
        </div>

        {/* Specs Row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3 text-[10px] sm:text-xs text-muted-foreground">
          {car.mileage && (
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Gauge className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">{car.mileage}</span>
            </div>
          )}
          {car.fuel && (
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Fuel className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>{car.fuel}</span>
            </div>
          )}
          {car.transmission && (
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Car className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>{car.transmission.replace(/Automatic.*/, "Auto")}</span>
            </div>
          )}
        </div>

        {/* Listed Date - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <Calendar className="w-3.5 h-3.5" />
          <span>Listed on {car.year}</span>
        </div>

        {/* Description - Hidden on mobile */}
        {cleanSummary && (
          <p className="hidden sm:block text-xs text-muted-foreground line-clamp-1 mb-4">
            {cleanSummary}
          </p>
        )}

        {/* CTA Button */}
        <div className="mt-3 sm:mt-4">
          <Button 
            onClick={() => window.location.href = `/car/${car.id}`}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-9 text-xs sm:text-sm font-medium"
            disabled={isSoldOut}
          >
            {isSoldOut ? "Sold Out" : "Shop Now"}
          </Button>
        </div>
      </CardContent>
    </Card>
    </div>
  )
}
