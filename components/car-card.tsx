"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Fuel, Gauge, MapPin, Star, Car, Tag } from "lucide-react"
import type { Car as CarType } from "@/lib/cars-data"
import { isThirdPartyCar } from "@/lib/cars-data"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"

interface CarCardProps {
  car: CarType
  /** Denser layout for multi-column grids (e.g. 5-up on the home sections) */
  compact?: boolean
  showBadge?: boolean
  badgeText?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  delay?: number
}

export function CarCard({ car, compact, showBadge, badgeText, badgeVariant = "default", delay = 0 }: CarCardProps) {
  const isSoldOut = car.category === "sold-out"
  const isComingSoon = car.category === "coming-soon"
  const yearPrefix = car.year ? `${car.year} ` : ""
  const isThirdParty = isThirdPartyCar(car)
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
      <Card
        className={cn(
          "group overflow-hidden border-border bg-card hover:shadow-xl transition-all duration-300",
          compact ? "rounded-xl" : "rounded-2xl",
          isSoldOut && "opacity-80",
        )}
      >
      {/* Image Container */}
      <div
        className={cn(
          "relative overflow-hidden bg-muted",
          compact ? "aspect-[3/2] sm:aspect-[3/2]" : "aspect-[4/3] sm:aspect-[4/3]",
        )}
      >
        <Image
          src={car.image || "/placeholder.svg"}
          alt={`${yearPrefix}${car.name}`}
          fill
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isSoldOut ? "grayscale" : ""}`}
          style={shouldFlipImage ? { transform: 'scaleX(-1)' } : undefined}
          sizes={
            compact
              ? "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          }
          unoptimized={car.image?.startsWith('http')}
        />
        
        {/* Location & Rating Badge */}
        <div
          className={cn(
            "absolute flex flex-wrap",
            compact
              ? "top-1.5 left-1.5 gap-1"
              : "top-2 left-2 sm:top-3 sm:left-3 gap-1.5 sm:gap-2",
          )}
        >
          <div
            className={cn(
              "flex items-center bg-foreground/80 backdrop-blur-sm text-white rounded-full",
              compact
                ? "gap-0.5 text-[9px] px-1 py-0.5"
                : "gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-1.5 py-1 sm:px-2.5 sm:py-1.5",
            )}
          >
            <MapPin className={cn(compact ? "w-2 h-2" : "w-2.5 h-2.5 sm:w-3 sm:h-3")} />
            <span className={cn(compact ? "hidden min-[480px]:inline" : "hidden sm:inline")}>
              Dar es Salaam
            </span>
            <span className={cn(compact ? "min-[480px]:hidden" : "sm:hidden")}>DSM</span>
          </div>
        </div>
        
        <div
          className={cn(
            "absolute",
            compact ? "top-1.5 right-1.5" : "top-2 right-2 sm:top-3 sm:right-3",
          )}
        >
          <div
            className={cn(
              "flex items-center bg-foreground/80 backdrop-blur-sm text-white rounded-full",
              compact
                ? "gap-0.5 text-[9px] px-1 py-0.5"
                : "gap-0.5 sm:gap-1 text-[10px] sm:text-xs px-1.5 py-1 sm:px-2.5 sm:py-1.5",
            )}
          >
            <Star
              className={cn(
                "fill-yellow-400 text-yellow-400",
                compact ? "w-2 h-2" : "w-2.5 h-2.5 sm:w-3 sm:h-3",
              )}
            />
            <span>4.8</span>
          </div>
        </div>

        {/* Status Badges */}
        {(isSoldOut || isComingSoon || isThirdParty || (showBadge && badgeText)) && (
          <div
            className={cn(
              "absolute flex flex-wrap max-w-[calc(100%-0.75rem)]",
              compact ? "bottom-1.5 left-1.5 gap-1" : "bottom-2 left-2 sm:bottom-3 sm:left-3 gap-2",
            )}
          >
            {/* Third Party Badge - Always show if it's third party */}
            {isThirdParty && (
              <Badge
                className={cn(
                  "font-medium bg-purple-600 text-white",
                  compact
                    ? "text-[9px] px-1.5 py-px leading-tight"
                    : "text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1",
                )}
              >
                Third Party
              </Badge>
            )}
            
            {/* Other badges */}
            {showBadge && badgeText && !isSoldOut && !isComingSoon && (
              <Badge
                variant={badgeVariant}
                className={cn(
                  "font-medium bg-primary text-primary-foreground",
                  compact
                    ? "text-[9px] px-1.5 py-px leading-tight"
                    : "text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1",
                )}
              >
                {badgeText}
              </Badge>
            )}
            {isSoldOut && (
              <Badge
                variant="secondary"
                className={cn(
                  "font-medium bg-foreground/90 text-white",
                  compact
                    ? "text-[9px] px-1.5 py-px leading-tight"
                    : "text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1",
                )}
              >
                Sold
              </Badge>
            )}
            {isComingSoon && !isThirdParty && (
              <Badge
                className={cn(
                  "font-medium bg-primary text-primary-foreground",
                  compact
                    ? "text-[9px] px-1.5 py-px leading-tight"
                    : "text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1",
                )}
              >
                Coming Soon
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className={cn(compact ? "p-2 sm:p-2.5 lg:p-3" : "p-3 sm:p-4")}>
        {/* Car Name */}
        <div className={cn(compact ? "mb-1.5 sm:mb-2" : "mb-2 sm:mb-3")}>
          <h3
            className={cn(
              "font-semibold text-foreground line-clamp-2 sm:line-clamp-1",
              compact ? "text-[11px] sm:text-xs leading-snug" : "text-sm sm:text-base truncate",
            )}
          >
            {yearPrefix}{car.name}
          </h3>
        </div>

        {/* Price */}
        <div className={cn(compact ? "mb-1.5" : "mb-2")}>
          <span
            className={cn(
              "font-bold text-foreground leading-tight block",
              compact ? "text-xs sm:text-sm" : "text-base sm:text-xl",
            )}
          >
            {car.price}
          </span>
        </div>

        {/* Specs Row */}
        <div
          className={cn(
            "flex flex-wrap items-center text-muted-foreground",
            compact
              ? "gap-1.5 mb-1.5 text-[9px] sm:text-[10px]"
              : "gap-2 sm:gap-3 mb-2 sm:mb-3 text-[10px] sm:text-xs",
          )}
        >
          {car.mileage && (
            <div className="flex items-center gap-0.5 min-w-0">
              <Gauge className={cn("shrink-0", compact ? "w-2.5 h-2.5" : "w-3 h-3 sm:w-3.5 sm:h-3.5")} />
              <span className="truncate">{car.mileage}</span>
            </div>
          )}
          {car.fuel && (
            <div className="flex items-center gap-0.5">
              <Fuel className={cn("shrink-0", compact ? "w-2.5 h-2.5" : "w-3 h-3 sm:w-3.5 sm:h-3.5")} />
              <span className="truncate">{car.fuel}</span>
            </div>
          )}
          {car.transmission && (
            <div className={cn("flex items-center gap-0.5", compact && "lg:hidden")}>
              <Car className={cn("shrink-0", compact ? "w-2.5 h-2.5" : "w-3 h-3 sm:w-3.5 sm:h-3.5")} />
              <span className="truncate">{car.transmission.replace(/Automatic.*/, "Auto")}</span>
            </div>
          )}
        </div>

        {/* Condition - Hidden on mobile */}
        {car.condition && (
          <div
            className={cn(
              "items-center gap-1.5 text-muted-foreground",
              compact
                ? "hidden xl:flex text-[10px] mb-2"
                : "hidden sm:flex text-xs mb-3",
            )}
          >
            <Tag className={cn("shrink-0", compact ? "w-3 h-3" : "w-3.5 h-3.5")} />
            <span className="capitalize truncate">
              {car.condition.toLowerCase() === "new"
                ? "Brand New"
                : car.condition.replace(/_/g, " ")}
            </span>
          </div>
        )}

        {/* Description - Hidden on mobile */}
        {cleanSummary && (
          <p
            className={cn(
              "text-muted-foreground line-clamp-1",
              compact ? "hidden xl:block text-[10px] mb-2" : "hidden sm:block text-xs mb-4",
            )}
          >
            {cleanSummary}
          </p>
        )}

        {/* CTA Button */}
        <div className={cn(compact ? "mt-2 sm:mt-2.5" : "mt-3 sm:mt-4")}>
          <Button 
            onClick={() => window.location.href = `/car/${car.id}`}
            className={cn(
              "w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-medium",
              compact ? "h-7 sm:h-8 text-[10px] sm:text-xs px-2" : "h-9 text-xs sm:text-sm",
            )}
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
