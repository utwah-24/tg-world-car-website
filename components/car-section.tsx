"use client"

import { CarCard } from "@/components/car-card"
import { Button } from "@/components/ui/button"
import type { Car } from "@/lib/cars-data"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"

interface CarSectionProps {
  id: string
  title: string
  subtitle?: string
  cars: Car[]
  maxCars?: number
  showBadge?: boolean
  badgeText?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  hideSeeMore?: boolean
  seeMoreHref?: string
  /** Orange accent band (#FF6A00) for sections e.g. Coming Soon preview */
  variant?: "default" | "dark"
  /** Name + price only on cards; no Shop Now or spec rows */
  minimalCarCards?: boolean
  /** Hide cards beyond this index on mobile (< sm). Others still render on sm+. */
  mobileMaxCars?: number
}

export function CarSection({ 
  id, 
  title, 
  subtitle, 
  cars,
  maxCars,
  showBadge, 
  badgeText, 
  badgeVariant,
  hideSeeMore,
  seeMoreHref = "/shop",
  variant = "default",
  minimalCarCards = false,
  mobileMaxCars,
}: CarSectionProps) {
  const displayedCars = maxCars ? cars.slice(0, maxCars) : cars
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 })
  const isDark = variant === "dark"

  return (
    <section
      id={id}
      className={cn(
        "py-12 lg:py-20 scroll-mt-20 lg:scroll-mt-24",
        isDark && "bg-[#0A1628] border-t border-white/10",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`mb-8 lg:mb-12 transition-all duration-700 ease-out ${
            headerVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <h2
            className={cn(
              "text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight",
              isDark ? "text-white" : "text-foreground",
            )}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className={cn(
                "mt-2 text-base max-w-2xl",
                isDark ? "text-white/85" : "text-muted-foreground",
              )}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Cars Grid — up to 5 columns on large screens with compact cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 lg:gap-3">
          {displayedCars.map((car, index) => (
            <div
              key={car.id}
              className={cn(
                mobileMaxCars !== undefined && index >= mobileMaxCars
                  ? "hidden sm:block"
                  : undefined,
              )}
            >
              <CarCard
                car={car}
                compact
                showBadge={showBadge}
                badgeText={badgeText}
                badgeVariant={badgeVariant}
                delay={index * 100}
                minimalListing={minimalCarCards}
              />
            </div>
          ))}
        </div>

        {/* See More Button */}
        {!hideSeeMore && (
          <div className="mt-10 text-center">
            <a href={seeMoreHref}>
              <Button
                variant="outline"
                className={cn(
                  "rounded-full px-8 h-11 bg-transparent",
                  isDark
                    ? "border-white/50 text-white hover:bg-white hover:text-[#0A1628] hover:border-white"
                    : "border-primary text-primary hover:bg-primary hover:text-primary-foreground",
                )}
              >
                See More {title}
              </Button>
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
