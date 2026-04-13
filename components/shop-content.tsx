"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { CarCard } from "./car-card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { isThirdPartyCar, type Car } from "@/lib/cars-data"
import { Car as CarIcon, Search, X, RotateCcw, SlidersHorizontal } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

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
    return cars.filter(isThirdPartyCar)
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const hasActiveFilters = activeType !== null || activeCondition !== null || !!selectedCompany || !!selectedBrand

  // Prevent document scroll; only the car list panel scrolls (see layout: h-[100dvh] overflow-hidden).
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevHtml = html.style.overflow
    const prevBody = body.style.overflow
    html.style.overflow = "hidden"
    body.style.overflow = "hidden"
    return () => {
      html.style.overflow = prevHtml
      body.style.overflow = prevBody
    }
  }, [])

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

  const filterPanel = (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search by name, make, model or year…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="h-11 pl-10 pr-10 text-sm rounded-xl border-border bg-card"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Select value={selectedCompany || "__all__"} onValueChange={handleCompanyChange}>
          <SelectTrigger className="h-11 w-full rounded-xl border-border bg-card text-sm">
            <SelectValue placeholder="Company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Companies</SelectItem>
            {companyOptions.map(company => (
              <SelectItem key={company} value={company}>{company}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedBrand || "__all__"} onValueChange={handleBrandChange}>
          <SelectTrigger className="h-11 w-full rounded-xl border-border bg-card text-sm">
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

      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
          Type
        </span>
        <div className="flex flex-col gap-2">
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
                className={`w-full justify-between rounded-xl h-10 px-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-transparent border-border text-foreground hover:bg-muted"
                }`}
              >
                <span>{filter.label}</span>
                <span className="text-xs opacity-70 tabular-nums">({count})</span>
              </Button>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
          Condition
        </span>
        <div className="flex flex-col gap-2">
          {conditionFilters.map((filter) => {
            const count = filterByType(cars, activeType).filter(car => {
              if (filter.apiCondition === "third_party") {
                return isThirdPartyCar(car)
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
                className={`w-full justify-start rounded-xl h-10 px-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-transparent border-border text-foreground hover:bg-muted"
                }`}
              >
                {"iconPath" in filter && (
                  <Image src={(filter as { iconPath: string }).iconPath} alt={filter.label} width={18} height={18} className="mr-2 shrink-0" />
                )}
                <span className="flex-1 text-left">{filter.label}</span>
                <span className="text-xs opacity-70 tabular-nums">({count})</span>
              </Button>
            )
          })}
        </div>
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="w-full rounded-xl h-10 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-2" />
          Clear filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      {/* Mobile: filters open from the right; desktop uses docked aside */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent
          id="shop-filters-sheet"
          side="right"
          className="flex h-full max-h-[100dvh] w-full flex-col gap-0 overflow-hidden border-l bg-background p-0 sm:max-w-md z-[100]"
        >
          <div className="shrink-0 border-b border-border px-6 pb-4 pt-12">
            <SheetHeader className="space-y-1 text-left">
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription className="sr-only">
                Narrow the vehicle list by search, company, brand, type, and condition.
              </SheetDescription>
            </SheetHeader>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
            {filterPanel}
          </div>
          <div className="shrink-0 border-t border-border bg-background px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button
              type="button"
              className="h-12 w-full rounded-xl text-base font-semibold"
              onClick={() => {
                setMobileFiltersOpen(false)
                requestAnimationFrame(() => {
                  document.getElementById("shop-car-list-scroll")?.scrollTo({ top: 0, behavior: "smooth" })
                })
              }}
            >
              Apply filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Button
        type="button"
        variant="default"
        size="lg"
        onClick={() => setMobileFiltersOpen(true)}
        className="lg:hidden fixed right-4 z-40 h-12 rounded-full pl-4 pr-5 shadow-lg gap-2 pointer-events-auto top-[calc(4.5rem+env(safe-area-inset-top,0px))]"
        aria-haspopup="dialog"
        aria-expanded={mobileFiltersOpen}
        aria-controls="shop-filters-sheet"
      >
        <SlidersHorizontal className="h-5 w-5 shrink-0" aria-hidden />
        <span className="font-semibold">Filters</span>
        {hasActiveFilters && (
          <span className="h-2 w-2 shrink-0 rounded-full bg-primary-foreground shadow-sm" aria-hidden />
        )}
      </Button>

      {/* Mobile / tablet: title first with page padding */}
      <div className="mb-6 mt-4 shrink-0 px-4 pr-[7.5rem] sm:px-6 lg:hidden">
        <div className="animate-fade-in-up text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-2 tracking-tight">
            Shop All Vehicles
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Browse our complete inventory of {cars.length} quality vehicles
          </p>
        </div>
      </div>

      {/* flex-1 min-h-0 so this row gets a bounded height; only the grid panel scrolls */}
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="hidden shrink-0 flex-col lg:flex lg:h-full lg:min-h-0 lg:w-72 lg:px-0 xl:w-80">
          <aside
            className="w-full rounded-2xl border border-border bg-card/60 p-5 shadow-sm
              lg:flex lg:flex-col lg:rounded-none lg:border-0 lg:border-r lg:border-border lg:bg-muted/30 lg:shadow-none
              lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain
              lg:py-6 lg:pl-6 lg:pr-5 xl:pl-8"
          >
            <p className="hidden lg:block text-sm font-semibold text-foreground mb-4 pb-3 border-b border-border shrink-0">
              Filters
            </p>
            <div className="lg:min-h-0">{filterPanel}</div>
          </aside>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-4 sm:px-6 lg:pl-8 lg:pr-6 xl:pr-8">
          {/* Desktop title: top-left above the scrollable grid */}
          <div className="hidden lg:block shrink-0 mb-4 pt-2 animate-fade-in-up text-left">
            <h1 className="text-3xl xl:text-4xl font-extrabold text-foreground mb-1 tracking-tight">
              Shop All Vehicles
            </h1>
            <p className="text-muted-foreground text-sm">
              Browse our complete inventory of {cars.length} quality vehicles
            </p>
          </div>

          <div
            id="results"
            className="shrink-0 mb-4 animate-fade-in"
            style={{ animationDelay: "0.1s", opacity: 0, animationFillMode: "forwards" }}
          >
            <p className="text-sm text-muted-foreground text-left">
              Showing {filteredCars.length} {filteredCars.length === 1 ? "vehicle" : "vehicles"}
              {activeTypeLabel && <span> · {activeTypeLabel}</span>}
              {activeConditionLabel && <span> · {activeConditionLabel}</span>}
              {selectedCompany && <span> · {selectedCompany}</span>}
              {selectedBrand && <span> · {selectedBrand}</span>}
              {searchQuery && <span> matching &ldquo;{searchQuery}&rdquo;</span>}
            </p>
          </div>

          {/* Only scroll target for the shop: cars list (all breakpoints) */}
          <div
            id="shop-car-list-scroll"
            className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain pb-6"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {filteredCars.length === 0 ? (
              <div className="text-center py-20">
                <CarIcon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No vehicles found
                </h3>
                <p className="text-muted-foreground">
                  Try selecting a different category
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-3 lg:gap-3">
                {filteredCars.map((car, index) => (
                  <div
                    key={car.id}
                    className="animate-fade-in-up"
                    style={{
                      animationDelay: `${0.15 + (index * 0.05)}s`,
                      opacity: 0,
                      animationFillMode: "forwards",
                    }}
                  >
                    <CarCard car={car} compact />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
