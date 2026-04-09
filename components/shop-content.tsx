"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { CarCard } from "./car-card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import type { Car } from "@/lib/cars-data"
import { Car as CarIcon, Search, X, RotateCcw } from "lucide-react"

interface ShopContentProps {
  cars: Car[]
}

const typeFilters = [
  { id: "suv",    label: "SUV",    apiType: "suv" },
  { id: "pickup", label: "Pickup", apiType: "pickup" },
  { id: "sedan",  label: "Sedan",  apiType: "sedan" },
  { id: "van",    label: "Van",    apiType: "van" },
  { id: "trucks", label: "Trucks", apiType: "truck" },
]

const conditionFilters = [
  { id: "new",         label: "New",         apiCondition: "new" },
  { id: "second_hand", label: "Second Hand", apiCondition: "second_hand" },
  { id: "third_party", label: "Third Party", iconPath: "/icons/third-party.png", apiCondition: "third_party" },
]

/** API may use "Truck" / "truck" or "trucks" — normalize for comparison */
function normalizeType(t: string): string {
  const x = t.toLowerCase().trim()
  if (x === "trucks") return "truck"
  return x
}

function filterByType(cars: Car[], typeId: string | null): Car[] {
  if (!typeId) return cars
  const want = normalizeType(typeId)
  return cars.filter(car => normalizeType(car.type || "") === want)
}

function filterByCondition(cars: Car[], conditionId: string | null): Car[] {
  if (!conditionId) return cars
  if (conditionId === "third_party") {
    return cars.filter(car => (car.description || "").toLowerCase().includes("[third_party]"))
  }
  return cars.filter(car => (car.condition || "").toLowerCase() === conditionId)
}

function filterByCompany(cars: Car[], company: string): Car[] {
  if (!company) return cars
  return cars.filter(car => (car.company || "").toLowerCase() === company.toLowerCase())
}

function filterByBrand(cars: Car[], brand: string): Car[] {
  if (!brand) return cars
  return cars.filter(car => (car.brand || "").toLowerCase() === brand.toLowerCase())
}

export function ShopContent({ cars }: ShopContentProps) {
  const [activeType, setActiveType] = useState<string | null>(null)
  const [activeCondition, setActiveCondition] = useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = useState("")
  const [selectedBrand, setSelectedBrand] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const hasActiveFilters = activeType !== null || activeCondition !== null || !!selectedCompany || !!selectedBrand

  // Unique sorted company list from all cars
  const companyOptions = useMemo(() => {
    const set = new Set<string>()
    cars.forEach(car => { if (car.company) set.add(car.company) })
    return Array.from(set).sort()
  }, [cars])

  // Brand list filtered to only brands that belong to the selected company (or all brands)
  const brandOptions = useMemo(() => {
    const source = selectedCompany ? filterByCompany(cars, selectedCompany) : cars
    const set = new Set<string>()
    source.forEach(car => { if (car.brand) set.add(car.brand) })
    return Array.from(set).sort()
  }, [cars, selectedCompany])

  // Read filters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    const category = params.get("category")
    if (category && typeFilters.some(f => f.id === category)) {
      setActiveType(category)
    }

    const company = params.get("company")
    if (company) {
      setSelectedCompany(decodeURIComponent(company))
    }
  }, [])

  const filteredCars = useMemo(() => {
    let filtered = filterByType(cars, activeType)
    filtered = filterByCondition(filtered, activeCondition)
    filtered = filterByCompany(filtered, selectedCompany)
    filtered = filterByBrand(filtered, selectedBrand)

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(car => {
        const searchText = `${car.name} ${car.year} ${car.fuel} ${car.transmission} ${car.description} ${car.company} ${car.brand}`.toLowerCase()
        return searchText.includes(query)
      })
    }

    return filtered
  }, [cars, activeType, activeCondition, selectedCompany, selectedBrand, searchQuery])

  const handleClearFilters = () => {
    setActiveType(null)
    setActiveCondition(null)
    setSelectedCompany("")
    setSelectedBrand("")
  }

  // When company changes, reset brand selection
  const handleCompanyChange = (value: string) => {
    setSelectedCompany(value === "__all__" ? "" : value)
    setSelectedBrand("")
  }

  const handleBrandChange = (value: string) => {
    setSelectedBrand(value === "__all__" ? "" : value)
  }

  const handleClearSearch = () => setSearchQuery("")

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" })
    }
  }

  const activeTypeLabel = typeFilters.find(f => f.id === activeType)?.label
  const activeConditionLabel = conditionFilters.find(f => f.id === activeCondition)?.label

  return (
    <div className="pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground mb-2 tracking-tight">
            Shop All Vehicles
          </h1>
          <p className="text-muted-foreground">
            Browse our complete inventory of {cars.length} quality vehicles
          </p>
        </div>

        {/* Search + Company + Brand */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s", opacity: 0, animationFillMode: "forwards" }}>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, make, model or year…"
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

            {/* Company dropdown */}
            <Select value={selectedCompany || "__all__"} onValueChange={handleCompanyChange}>
              <SelectTrigger className="h-14 w-full sm:w-44 rounded-xl border-border bg-card text-sm">
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Companies</SelectItem>
                {companyOptions.map(company => (
                  <SelectItem key={company} value={company}>{company}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Brand dropdown — filtered by selected company */}
            <Select value={selectedBrand || "__all__"} onValueChange={handleBrandChange}>
              <SelectTrigger className="h-14 w-full sm:w-44 rounded-xl border-border bg-card text-sm">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Brands</SelectItem>
                {brandOptions.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filters — Type + Condition */}
        <div className="mb-8 space-y-4 animate-fade-in-up" style={{ animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}>

          {/* Type row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground w-full sm:w-auto sm:mr-1">
              Type
            </span>
            {typeFilters.map((filter) => {
              const count = filterByCondition(cars, activeCondition).filter(
                car => normalizeType(car.type || "") === normalizeType(filter.apiType)
              ).length
              const isActive = activeType === filter.id
              return (
                <Button
                  key={filter.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveType(isActive ? null : filter.id)}
                  className={`rounded-full h-10 px-4 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "bg-transparent border-border text-foreground hover:bg-muted hover:scale-105"
                  }`}
                >
                  {filter.label}
                  <span className="ml-1.5 text-xs opacity-70">({count})</span>
                </Button>
              )
            })}
          </div>

          {/* Condition row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground w-full sm:w-auto sm:mr-1">
              Condition
            </span>
            {conditionFilters.map((filter) => {
              const count = filterByType(cars, activeType).filter(car => {
                if (filter.apiCondition === "third_party") {
                  return (car.description || "").toLowerCase().includes("[third_party]")
                }
                return (car.condition || "").toLowerCase() === filter.apiCondition
              }).length
              const isActive = activeCondition === filter.id
              return (
                <Button
                  key={filter.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCondition(isActive ? null : filter.id)}
                  className={`rounded-full h-10 px-4 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "bg-transparent border-border text-foreground hover:bg-muted hover:scale-105"
                  }`}
                >
                  {"iconPath" in filter && (
                    <Image src={(filter as { iconPath: string }).iconPath} alt={filter.label} width={18} height={18} className="mr-1.5" />
                  )}
                  {filter.label}
                  <span className="ml-1.5 text-xs opacity-70">({count})</span>
                </Button>
              )
            })}
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="rounded-full h-9 px-4 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Clear filters
              </Button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div id="results" className="mb-6 animate-fade-in" style={{ animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards" }}>
          <p className="text-sm text-muted-foreground">
            Showing {filteredCars.length} {filteredCars.length === 1 ? "vehicle" : "vehicles"}
            {activeTypeLabel && <span> · {activeTypeLabel}</span>}
            {activeConditionLabel && <span> · {activeConditionLabel}</span>}
            {selectedCompany && <span> · {selectedCompany}</span>}
            {selectedBrand && <span> · {selectedBrand}</span>}
            {searchQuery && <span> matching &ldquo;{searchQuery}&rdquo;</span>}
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
