"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Fuel, Gauge, MapPin, Tag } from "lucide-react"
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

function mileageFromDescription(description: string): string | null {
  if (!description) return null
  const m = description.match(/Mileage\s*:\s*([^\r\n]+)/i)
  return m ? m[1].trim() : null
}

function fuelFromDescription(description: string): string | null {
  if (!description) return null
  const m = description.match(/Fuel\s*:\s*([^\r\n]+)/i)
  return m ? m[1].trim() : null
}

function normalizeFuelDisplay(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null
  const l = raw.trim().toLowerCase()
  if (l.includes("diesel")) return "Diesel"
  if (l.includes("petrol") || l.includes("gasoline")) return "Petrol"
  if (l.includes("electric")) return "Electric"
  if (l.includes("hybrid")) return "Hybrid"
  return raw.trim().charAt(0).toUpperCase() + raw.trim().slice(1)
}

function conditionLabel(car: CarType): string {
  if (isThirdPartyCar(car)) return "Third Party"
  const c = (car.condition || "").toLowerCase().trim()
  if (!c) return "—"
  if (c === "new") return "Brand New"
  if (c === "second_hand") return "Second Hand"
  return (car.condition || "").replace(/_/g, " ").replace(/\b\w/g, (x) => x.toUpperCase())
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

  const getCleanSummary = (description: string): string => {
    if (!description) return ""

    const clean = description.replace("[THIRD_PARTY] ", "")

    const engineMatch = clean.match(/Engine Size\s*:\s*([^\r\n]+)/i)
    const transMatch = clean.match(/Transmission\s*:\s*([^\r\n]+)/i)
    const driveMatch = clean.match(/Drive\s*:\s*(AWD|4WD|FWD|RWD)/i)
    const seatsMatch = clean.match(/Seat Capacity\s*:\s*(\d+)/i)
    const colorMatch = clean.match(/Colou?r\s*:\s*([^\r\n]+)/i)
    const bodyMatch = clean.match(/Body Type\s*:\s*([^\r\n]+)/i)

    const details: string[] = []
    if (engineMatch) details.push(engineMatch[1].trim().split(/\s+/)[0])
    if (transMatch) {
      const t = transMatch[1].trim()
      details.push(t.replace(/Automatic.*/i, "Auto").replace(/Manual.*/i, "Manual"))
    }
    if (driveMatch) details.push(driveMatch[1])
    if (seatsMatch) details.push(`${seatsMatch[1]} seats`)
    if (bodyMatch) details.push(bodyMatch[1].trim())
    if (colorMatch && !colorMatch[1].includes("Price") && !colorMatch[1].includes("Engine")) {
      details.push(colorMatch[1].trim().split("\n")[0])
    }

    if (details.length > 0) return details.slice(0, 4).join(" · ")

    const lines = clean
      .split("\n")
      .map((l) => l.trim())
      .filter(
        (line) =>
          line.length > 0 &&
          !/^price\s*:/i.test(line) &&
          !/^mileage\s*:/i.test(line) &&
          !/^fuel\s*:/i.test(line) &&
          !/^transmission\s*:/i.test(line) &&
          !/^location\s*:/i.test(line),
      )
    return lines[0] ? lines[0].substring(0, 90) : ""
  }

  const desc = car.description || ""
  const mileageDisplay =
    (car.mileage && car.mileage.trim()) || mileageFromDescription(desc) || "—"
  const fuelDisplay =
    normalizeFuelDisplay(car.fuel || fuelFromDescription(desc)) || "—"
  const conditionDisplay = conditionLabel(car)
  const cleanSummary = desc ? getCleanSummary(desc) : ""

  const registration = car.registered

  return (
    <div
      ref={ref}
      className={`h-full transition-all duration-700 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <Card
        className={cn(
          "group h-full flex flex-col overflow-hidden border-border bg-card hover:shadow-xl transition-all duration-300",
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
        
        {/* Location (top-left) & registration tag (top-right) */}
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
        
        {registration !== undefined && (
          <div
            className={cn(
              "absolute",
              compact ? "top-1.5 right-1.5" : "top-2 right-2 sm:top-3 sm:right-3",
            )}
          >
            <div
              className={cn(
                "flex items-center rounded-full font-medium backdrop-blur-sm",
                registration
                  ? "bg-emerald-600/95 text-white"
                  : "bg-background/90 text-foreground border border-border/80 shadow-sm",
                compact
                  ? "text-[9px] px-1.5 py-0.5"
                  : "text-[10px] sm:text-xs px-1.5 py-1 sm:px-2.5 sm:py-1.5",
              )}
            >
              {registration ? "Registered" : "Unregistered"}
            </div>
          </div>
        )}

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
      <CardContent className={cn("flex flex-col flex-1", compact ? "p-2 sm:p-2.5 lg:p-3" : "p-3 sm:p-4")}>
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

        {/* Mileage · fuel · condition — always shown; values parsed from description when API fields are empty */}
        <div
          className={cn(
            "flex flex-wrap items-center text-muted-foreground",
            compact
              ? "gap-x-2 gap-y-1 mb-1.5 text-[9px] sm:text-[10px]"
              : "gap-x-2 sm:gap-x-3 gap-y-1 mb-2 sm:mb-3 text-[10px] sm:text-xs",
          )}
        >
          <div className="flex items-center gap-0.5 min-w-0 max-w-full">
            <Gauge className={cn("shrink-0", compact ? "w-2.5 h-2.5" : "w-3 h-3 sm:w-3.5 sm:h-3.5")} />
            <span className="truncate">{mileageDisplay}</span>
          </div>
          <div className="flex items-center gap-0.5 min-w-0 max-w-full">
            <Fuel className={cn("shrink-0", compact ? "w-2.5 h-2.5" : "w-3 h-3 sm:w-3.5 sm:h-3.5")} />
            <span className="truncate">{fuelDisplay}</span>
          </div>
          <div className="flex items-center gap-0.5 min-w-0 max-w-full">
            <Tag className={cn("shrink-0", compact ? "w-2.5 h-2.5" : "w-3 h-3 sm:w-3.5 sm:h-3.5")} />
            <span className="truncate">{conditionDisplay}</span>
          </div>
        </div>

        {/* Extra detail from description (transmission, engine, color, etc.) */}
        {cleanSummary ? (
          <p
            className={cn(
              "text-muted-foreground line-clamp-2 leading-snug",
              compact ? "text-[9px] sm:text-[10px] mb-2" : "text-xs mb-4",
            )}
          >
            {cleanSummary}
          </p>
        ) : (
          <div className={cn(compact ? "mb-1" : "mb-2")} aria-hidden />
        )}

        {/* CTA Button */}
        <div className={cn("mt-auto", compact ? "pt-2 sm:pt-2.5" : "pt-3 sm:pt-4")}>
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
