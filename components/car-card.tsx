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
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })

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
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
        {(isSoldOut || isComingSoon || (showBadge && badgeText)) && (
          <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
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
            {isComingSoon && (
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
        {car.description && (
          <p className="hidden sm:block text-xs text-muted-foreground line-clamp-2 mb-4">
            {car.description}
          </p>
        )}

        {/* CTA Buttons */}
        <div className="flex gap-2 mt-3 sm:mt-4">
          <Button 
            className="flex-[2] bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-9 text-xs sm:text-sm font-medium px-3 sm:px-4"
            disabled={isSoldOut}
          >
            {isSoldOut ? "Sold" : "Shop Now"}
          </Button>
          <Button 
            variant="outline"
            className="flex-1 rounded-full h-9 text-xs sm:text-sm border-border text-foreground hover:bg-muted bg-transparent px-2 sm:px-4"
          >
            <span>View</span>
          </Button>
        </div>
      </CardContent>
    </Card>
    </div>
  )
}
