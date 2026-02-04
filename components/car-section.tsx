"use client"

import { useState } from "react"
import { CarCard } from "@/components/car-card"
import { Button } from "@/components/ui/button"
import type { Car } from "@/lib/cars-data"
import { Zap, Car as CarIcon, Truck, Sparkles } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

interface CarSectionProps {
  id: string
  title: string
  subtitle?: string
  cars: Car[]
  showBadge?: boolean
  badgeText?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  showFilters?: boolean
}

const categories = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "suv", label: "SUV", icon: CarIcon },
  { id: "truck", label: "Truck", icon: Truck },
  { id: "luxury", label: "Luxury", icon: Zap },
]

export function CarSection({ 
  id, 
  title, 
  subtitle, 
  cars, 
  showBadge, 
  badgeText, 
  badgeVariant,
  showFilters = false
}: CarSectionProps) {
  const [activeFilter, setActiveFilter] = useState("all")
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 })

  return (
    <section id={id} className="py-12 lg:py-20">
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
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-base text-muted-foreground max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Category Filters */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Button
                  key={category.id}
                  variant={activeFilter === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(category.id)}
                  className={`rounded-full h-9 px-4 ${
                    activeFilter === category.id 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-transparent border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-1.5" />
                  {category.label}
                </Button>
              )
            })}
          </div>
        )}

        {/* Cars Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {cars.map((car, index) => (
            <CarCard 
              key={car.id} 
              car={car} 
              showBadge={showBadge}
              badgeText={badgeText}
              badgeVariant={badgeVariant}
              delay={index * 100}
            />
          ))}
        </div>

        {/* See More Button */}
        <div className="mt-10 text-center">
          <Button 
            variant="outline" 
            className="rounded-full px-8 h-11 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
          >
            See More {title}
          </Button>
        </div>
      </div>
    </section>
  )
}
