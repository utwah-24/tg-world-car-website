"use client"

import { useState, useMemo, useEffect } from "react"
import { CarCard } from "./car-card"
import { buildCompanyLogoMap, BrandOptionRow, CompanyOptionRow } from "@/components/company-select-option"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { isThirdPartyCar, type Car } from "@/lib/cars-data"
import { Car as CarIcon, Search, X, RotateCcw, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { buildShopTypeFilterRows, normalizeCarType, labelForCanonicalCarType, candidateCarTypeIconPaths } from "@/lib/car-type"
import { parsePriceMillions } from "@/lib/find-your-car-filter"
import { isCarInLatestWindow } from "@/lib/latest-cars"
import type { CompanyLogo } from "@/lib/api"
import { cn } from "@/lib/utils"

/** Renders a type icon from /public/icons/, hiding itself silently on 404. */
function ShopTypeIcon({ canon, label }: { canon: string; label: string }) {
  const candidates = useMemo(() => candidateCarTypeIconPaths(canon, label), [canon, label])
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    setIdx(0)
  }, [candidates])

  if (idx >= candidates.length) return null

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={candidates[idx]}
      alt={label}
      width={18}
      height={18}
      className="shrink-0 object-contain w-[18px] h-[18px]"
      onError={() => setIdx((i) => i + 1)}
    />
  )
}

interface ShopContentProps {
  cars: Car[]
  companyLogos?: CompanyLogo[]
}

const conditionFilters = [
  { id: "new",         label: "New",         apiCondition: "new" },
  { id: "second_hand", label: "Second Hand", apiCondition: "second_hand" },
  { id: "third_party", label: "Third Party", apiCondition: "third_party" },
]

const registrationFilters = [
  { id: "registered", label: "Registered" },
  { id: "unregistered", label: "Unregistered" },
]

function filterByType(cars: Car[], typeId: string | null): Car[] {
  if (!typeId) return cars
  const want = normalizeCarType(typeId)
  return cars.filter((car) => normalizeCarType(car.type || "") === want)
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

function filterByRegistration(cars: Car[], registrationId: string | null): Car[] {
  if (!registrationId) return cars
  if (registrationId === "registered") return cars.filter((car) => car.registered === true)
  if (registrationId === "unregistered") return cars.filter((car) => car.registered === false)
  return cars
}

/** Shop sidebar buckets: under 15M, then 25M-wide bands through 140M, then over 140M */
const PRICE_BUCKETS: { id: string; label: string; match: (pm: number) => boolean }[] = [
  { id: "price-under-15", label: "Under 15 million Tshs", match: (pm) => pm < 15 },
  { id: "price-15-40", label: "15 million - 40 million Tshs", match: (pm) => pm >= 15 && pm < 40 },
  { id: "price-40-65", label: "40 million - 65 million Tshs", match: (pm) => pm >= 40 && pm < 65 },
  { id: "price-65-90", label: "65 million - 90 million Tshs", match: (pm) => pm >= 65 && pm < 90 },
  { id: "price-90-115", label: "90 million - 115 million Tshs", match: (pm) => pm >= 90 && pm < 115 },
  { id: "price-115-140", label: "115 million - 140 million Tshs", match: (pm) => pm >= 115 && pm < 140 },
  { id: "price-over-140", label: "Over 140 million Tshs", match: (pm) => pm >= 140 },
]

function filterByPriceBucket(cars: Car[], bucketId: string | null): Car[] {
  if (!bucketId) return cars
  const bucket = PRICE_BUCKETS.find((b) => b.id === bucketId)
  if (!bucket) return cars
  return cars.filter((car) => {
    const pm = parsePriceMillions(car.price || "")
    if (pm == null) return false
    return bucket.match(pm)
  })
}

export function ShopContent({ cars, companyLogos = [] }: ShopContentProps) {
  const [activeType, setActiveType] = useState<string | null>(null)
  const [activeCondition, setActiveCondition] = useState<string | null>(null)
  const [activePriceRange, setActivePriceRange] = useState<string | null>(null)
  const [activeLatest, setActiveLatest] = useState(false)
  const [activeRegistration, setActiveRegistration] = useState<string | null>(null)
  const [priceOpen, setPriceOpen] = useState(false)
  const [typeOpen, setTypeOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState("")
  const [selectedBrand, setSelectedBrand] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [desktopFiltersVisible, setDesktopFiltersVisible] = useState(true)

  const hasActiveFilters =
    activeType !== null ||
    activeCondition !== null ||
    activePriceRange !== null ||
    activeLatest ||
    activeRegistration !== null ||
    !!selectedCompany ||
    !!selectedBrand

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

  const companyLogoMap = useMemo(() => buildCompanyLogoMap(companyLogos), [companyLogos])

  // Brand list filtered to only brands that belong to the selected company (or all brands)
  const brandOptions = useMemo(() => {
    const source = selectedCompany ? filterByCompany(cars, selectedCompany) : cars
    const set = new Set<string>()
    source.forEach(car => { if (car.brand) set.add(car.brand) })
    return Array.from(set).sort()
  }, [cars, selectedCompany])

  /** First inventory company per brand (for logo); when a company filter is set, logos match that dealer. */
  const companyNameForBrand = useMemo(() => {
    const source = selectedCompany ? filterByCompany(cars, selectedCompany) : cars
    const m = new Map<string, string>()
    for (const car of source) {
      if (!car.brand || !car.company) continue
      if (!m.has(car.brand)) m.set(car.brand, car.company)
    }
    return m
  }, [cars, selectedCompany])

  /** Type filters: built from live inventory so any new API `type` appears after normalizeCarType(). */
  const typeFilters = useMemo(() => buildShopTypeFilterRows(cars), [cars])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const company = params.get("company")
    if (company) setSelectedCompany(decodeURIComponent(company))
    if (params.get("latest") === "1") setActiveLatest(true)
  }, [])

  // Apply ?category= once inventory lists that type (new API types included automatically)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const category = params.get("category")
    const rows = buildShopTypeFilterRows(cars)
    if (category && rows.some((f) => f.id === category)) {
      setActiveType(category)
      setTypeOpen(true)
    }
  }, [cars])

  const carsMatchingFiltersExceptPriceAndRegistration = useMemo(() => {
    let filtered = filterByType(cars, activeType)
    filtered = filterByCondition(filtered, activeCondition)
    filtered = filterByCompany(filtered, selectedCompany)
    filtered = filterByBrand(filtered, selectedBrand)
    if (activeLatest) filtered = filtered.filter((car) => isCarInLatestWindow(car.createdAt))

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((car) => {
        const searchText = `${car.name} ${car.year} ${car.fuel} ${car.transmission} ${car.description} ${car.company} ${car.brand}`.toLowerCase()
        return searchText.includes(query)
      })
    }

    return filtered
  }, [cars, activeType, activeCondition, selectedCompany, selectedBrand, activeLatest, searchQuery])

  const carsMatchingFiltersExceptPrice = useMemo(
    () => filterByRegistration(carsMatchingFiltersExceptPriceAndRegistration, activeRegistration),
    [carsMatchingFiltersExceptPriceAndRegistration, activeRegistration],
  )

  const filteredCars = useMemo(() => {
    const results = filterByPriceBucket(carsMatchingFiltersExceptPrice, activePriceRange)
    return [...results].sort((a, b) => {
      const ta = a.createdAt ? Date.parse(a.createdAt) : 0
      const tb = b.createdAt ? Date.parse(b.createdAt) : 0
      return tb - ta
    })
  }, [carsMatchingFiltersExceptPrice, activePriceRange])

  const handleClearFilters = () => {
    setActiveType(null)
    setActiveCondition(null)
    setActivePriceRange(null)
    setActiveLatest(false)
    setActiveRegistration(null)
    setPriceOpen(false)
    setTypeOpen(false)
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
  const activeRegistrationLabel = registrationFilters.find((f) => f.id === activeRegistration)?.label
  const activePriceLabel = PRICE_BUCKETS.find((b) => b.id === activePriceRange)?.label

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
          <SelectTrigger className="h-11 w-full rounded-xl border-border bg-card text-sm [&>span]:flex [&>span]:min-w-0 [&>span]:items-center [&>span]:gap-2.5 [&>span]:line-clamp-none">
            <SelectValue placeholder="Company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Companies</SelectItem>
            {companyOptions.map(company => (
              <SelectItem key={company} value={company} className="py-2 pr-2 [&>span:last-child]:flex [&>span:last-child]:w-full [&>span:last-child]:min-w-0">
                <CompanyOptionRow name={company} logoMap={companyLogoMap} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedBrand || "__all__"} onValueChange={handleBrandChange}>
          <SelectTrigger className="h-11 w-full rounded-xl border-border bg-card text-sm [&>span]:flex [&>span]:min-w-0 [&>span]:items-center [&>span]:gap-2.5 [&>span]:line-clamp-none">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Brands</SelectItem>
            {brandOptions.map((brand) => (
              <SelectItem
                key={brand}
                value={brand}
                className="py-2 pr-2 [&>span:last-child]:flex [&>span:last-child]:w-full [&>span:last-child]:min-w-0"
              >
                <BrandOptionRow
                  brand={brand}
                  logoCompanyName={companyNameForBrand.get(brand) ?? ""}
                  logoMap={companyLogoMap}
                />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setPriceOpen((o) => !o)}
          className="flex w-full items-center justify-between py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>Shop by price</span>
          <ChevronDown
            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${priceOpen ? "rotate-180" : ""}`}
          />
        </button>

        {priceOpen && (
          <div className="flex flex-col gap-2 pt-1">
            {PRICE_BUCKETS.map((bucket) => {
              const count = carsMatchingFiltersExceptPrice.filter((car) => {
                const pm = parsePriceMillions(car.price || "")
                return pm != null && bucket.match(pm)
              }).length
              const isActive = activePriceRange === bucket.id
              return (
                <Button
                  key={bucket.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setActivePriceRange(isActive ? null : bucket.id); if (!priceOpen) setPriceOpen(true) }}
                  className={`group w-full justify-between rounded-xl h-10 px-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "border-border bg-transparent text-foreground hover:!bg-white hover:!text-black"
                  }`}
                >
                  <span className="min-w-0 truncate text-left">{bucket.label}</span>
                  <span className="text-xs opacity-70 tabular-nums shrink-0 group-hover:opacity-100">
                    ({count})
                  </span>
                </Button>
              )
            })}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
          Listing
        </span>
        <div className="flex flex-col gap-2">
          {(() => {
            const latestCount = cars.filter((car) => isCarInLatestWindow(car.createdAt)).length
            return (
              <Button
                variant={activeLatest ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveLatest(!activeLatest)}
                className={`group w-full justify-between rounded-xl h-10 px-3 text-sm font-medium transition-all duration-200 ${
                  activeLatest
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "border-border bg-transparent text-foreground hover:!bg-white hover:!text-black"
                }`}
              >
                <span>Latest cars</span>
                <span className="text-xs opacity-70 tabular-nums group-hover:opacity-100">({latestCount})</span>
              </Button>
            )
          })()}
          {registrationFilters.map((filter) => {
            const count =
              filter.id === "registered"
                ? carsMatchingFiltersExceptPriceAndRegistration.filter((c) => c.registered === true).length
                : carsMatchingFiltersExceptPriceAndRegistration.filter((c) => c.registered === false).length
            const isActive = activeRegistration === filter.id
            return (
              <Button
                key={filter.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveRegistration(isActive ? null : filter.id)}
                className={`group w-full justify-between rounded-xl h-10 px-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "border-border bg-transparent text-foreground hover:!bg-white hover:!text-black"
                }`}
              >
                <span>{filter.label}</span>
                <span className="text-xs opacity-70 tabular-nums group-hover:opacity-100">({count})</span>
              </Button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setTypeOpen((o) => !o)}
          className="flex w-full items-center justify-between py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>Type</span>
          <ChevronDown
            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${typeOpen ? "rotate-180" : ""}`}
          />
        </button>

        {typeOpen && (
          <div className="flex flex-col gap-2 pt-1">
            {typeFilters.map((filter) => {
              const count = filterByCondition(cars, activeCondition).filter(
                  (car) =>
                    normalizeCarType(car.type || "") === normalizeCarType(filter.apiType)
              ).length
              const isActive = activeType === filter.id
              return (
                <Button
                  key={filter.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setActiveType(isActive ? null : filter.id); if (!typeOpen) setTypeOpen(true) }}
                  className={`group w-full justify-between rounded-xl h-10 px-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "border-border bg-transparent text-foreground hover:!bg-white hover:!text-black"
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <ShopTypeIcon canon={filter.id} label={labelForCanonicalCarType(filter.id)} />
                    <span className="truncate">{filter.label}</span>
                  </span>
                  <span className="text-xs opacity-70 tabular-nums group-hover:opacity-100">({count})</span>
                </Button>
              )
            })}
          </div>
        )}
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
                className={`group w-full justify-start rounded-xl h-10 px-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "border-border bg-transparent text-foreground hover:!bg-white hover:!text-black"
                }`}
              >
                <span className="flex-1 text-left">{filter.label}</span>
                <span className="text-xs opacity-70 tabular-nums group-hover:opacity-100">({count})</span>
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
                Narrow the vehicle list by search, company, brand, price, listing, registration, type, and condition.
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
        <div
          className={cn(
            "hidden shrink-0 flex-col lg:flex lg:h-full lg:min-h-0 transition-[width] duration-200 ease-out",
            desktopFiltersVisible ? "lg:w-72 xl:w-80" : "lg:w-[52px] xl:w-[52px]",
          )}
        >
          {desktopFiltersVisible ? (
            <aside
              className="w-full rounded-2xl border border-border bg-card/60 p-5 shadow-sm
              lg:flex lg:flex-col lg:rounded-none lg:border-0 lg:border-r lg:border-border lg:bg-muted/30 lg:shadow-none
              lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain
              lg:py-6 lg:pl-6 lg:pr-5 xl:pl-8"
            >
              <div className="hidden lg:flex items-center justify-between gap-2 mb-4 pb-3 border-b border-border shrink-0">
                <span className="text-sm font-semibold text-foreground">Filters</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
                  aria-label="Hide filters panel"
                  onClick={() => setDesktopFiltersVisible(false)}
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                </Button>
              </div>
              <div className="lg:min-h-0">{filterPanel}</div>
            </aside>
          ) : (
            <div className="hidden lg:flex lg:h-full lg:min-h-0 lg:w-full lg:flex-col lg:items-center lg:border-r lg:border-border lg:bg-muted/30 lg:pt-4 lg:px-2 lg:pb-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-xl border-border bg-card shadow-sm"
                aria-label="Show filters panel"
                onClick={() => setDesktopFiltersVisible(true)}
              >
                <ChevronRight className="h-5 w-5" aria-hidden />
              </Button>
              {hasActiveFilters && (
                <span
                  className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary"
                  aria-hidden
                  title="Filters active"
                />
              )}
            </div>
          )}
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
              {activeRegistrationLabel && <span> · {activeRegistrationLabel}</span>}
              {activePriceLabel && <span> · {activePriceLabel}</span>}
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
