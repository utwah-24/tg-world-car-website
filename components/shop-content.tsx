"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { CarCard } from "./car-card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import type { Car } from "@/lib/cars-data"
import { Car as CarIcon, Sparkles, Search, X } from "lucide-react"

interface ShopContentProps {
  cars: Car[]
}

const categories = [
  { id: "all", label: "All Vehicles", icon: Sparkles, isImage: false },
  { id: "suv", label: "SUV", iconPath: "/icons/suv.png", isImage: true, apiCategory: "SUV" },
  { id: "trucks", label: "Trucks", iconPath: "/icons/trucks.png", isImage: true, apiCategory: "TRUCKS" },
  { id: "third-party", label: "Third Party", iconPath: "/icons/third-party.png", isImage: true, apiCategory: "THIRD_PARTY" },
]

export function ShopContent({ cars }: ShopContentProps) {
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Read category from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const category = params.get('category')
    if (category && categories.some(c => c.id === category)) {
      setActiveCategory(category)
    }
  }, [])

  // Filter cars by category AND search query
  const filteredCars = useMemo(() => {
    let filtered = cars

    // First filter by category
    if (activeCategory !== "all") {
      const selectedCategory = categories.find(c => c.id === activeCategory)
      if (selectedCategory?.apiCategory) {
        filtered = filtered.filter(car => {
          const carCategory = car.description?.toUpperCase() || ""
          const carName = car.name.toUpperCase()
          
          if (selectedCategory.apiCategory === "SUV") {
            return carCategory.includes("SUV") || carName.includes("CRUISER") || 
                   carName.includes("FORTUNER") || carName.includes("RANGER") ||
                   carName.includes("FORESTER") || carName.includes("HARRIER") ||
                   carName.includes("RANGE ROVER")
          } else if (selectedCategory.apiCategory === "TRUCKS") {
            return carName.includes("TRUCK") || carCategory.includes("TRUCK")
          } else if (selectedCategory.apiCategory === "THIRD_PARTY") {
            // Check for third-party marker
            return carCategory.includes("[THIRD_PARTY]")
          }
          
          return false
        })
      }
    }

    // Then filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(car => {
        const searchText = `${car.name} ${car.year} ${car.fuel} ${car.transmission} ${car.description}`.toLowerCase()
        return searchText.includes(query)
      })
    }

    return filtered
  }, [cars, activeCategory, searchQuery])

  const handleClearSearch = () => {
    setSearchQuery("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Search is automatic, just scroll to results
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Shop All Vehicles
          </h1>
          <p className="text-muted-foreground">
            Browse our complete inventory of {cars.length} quality vehicles
          </p>
        </div>

        {/* Search Box */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s", opacity: 0, animationFillMode: "forwards" }}>
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by car name, make, model, or year (e.g., Toyota Land Cruiser 2024)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-14 pl-12 pr-12 text-base rounded-xl border-border bg-card"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}>
          <div className="flex flex-wrap items-center gap-3">
            {categories.map((category) => {
              const categoryCount = category.id === "all" 
                ? cars.length 
                : cars.filter(car => {
                    const carName = car.name.toUpperCase()
                    const carDesc = (car.description || "").toUpperCase()
                    
                    if (category.apiCategory === "SUV") {
                      return carName.includes("CRUISER") || 
                             carName.includes("FORTUNER") || 
                             carName.includes("RANGER") ||
                             carName.includes("FORESTER") || 
                             carName.includes("HARRIER") ||
                             carName.includes("RANGE ROVER")
                    } else if (category.apiCategory === "TRUCKS") {
                      return carName.includes("TRUCK")
                    } else if (category.apiCategory === "THIRD_PARTY") {
                      return carDesc.includes("[THIRD_PARTY]")
                    }
                    return false
                  }).length

              return (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  size="lg"
                  onClick={() => setActiveCategory(category.id)}
                  className={`rounded-full h-12 px-6 text-base font-medium transition-all duration-300 ${
                    activeCategory === category.id 
                      ? "bg-primary text-primary-foreground shadow-lg scale-105" 
                      : "bg-transparent border-border text-foreground hover:bg-muted hover:scale-105"
                  }`}
                >
                  {category.isImage && category.iconPath ? (
                    <Image 
                      src={category.iconPath} 
                      alt={category.label}
                      width={20}
                      height={20}
                      className="mr-2"
                    />
                  ) : category.icon ? (
                    <category.icon className="w-5 h-5 mr-2" />
                  ) : null}
                  {category.label}
                  <span className="ml-2 text-sm opacity-70">({categoryCount})</span>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Results Count */}
        <div id="results" className="mb-6 animate-fade-in" style={{ animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards" }}>
          <p className="text-sm text-muted-foreground">
            Showing {filteredCars.length} {filteredCars.length === 1 ? 'vehicle' : 'vehicles'}
            {activeCategory !== "all" && (
              <span> in {categories.find(c => c.id === activeCategory)?.label}</span>
            )}
            {searchQuery && (
              <span> matching "{searchQuery}"</span>
            )}
          </p>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {filteredCars.map((car, index) => (
            <div
              key={car.id}
              className="animate-fade-in-up"
              style={{ 
                animationDelay: `${0.3 + (index * 0.05)}s`, 
                opacity: 0, 
                animationFillMode: "forwards" 
              }}
            >
              <CarCard car={car} />
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredCars.length === 0 && (
          <div className="text-center py-20">
            <CarIcon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No vehicles found
            </h3>
            <p className="text-muted-foreground">
              Try selecting a different category
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
