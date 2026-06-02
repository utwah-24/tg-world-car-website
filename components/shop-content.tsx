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
import { parseMileageKm } from "@/lib/mileage-km"
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

function filterByModel(cars: Car[], model: string): Car[] {
  if (!model) return cars
  return cars.filter(car => (car.model || "").toLowerCase() === model.toLowerCase())
}

function filterByRegistration(cars: Car[], registrationId: string | null): Car[] {
  if (!registrationId) return cars
  if (registrationId === "registered") return cars.filter((car) => car.registered === true)
  if (registrationId === "unregistered") return cars.filter((car) => car.registered === false)
  return cars
}

function filterByInDar(cars: Car[], inDarOnly: boolean): Car[] {
  if (!inDarOnly) return cars
  return cars.filter((car) => car.inDar === true)
}

/** Shop sidebar price buckets (millions TZS) */
const PRICE_BUCKETS: { id: string; label: string; match: (pm: number) => boolean }[] = [
  { id: "price-under-20", label: "Under 20M Tshs", match: (pm) => pm < 20 },
  { id: "price-20-40", label: "20M – 40M Tshs", match: (pm) => pm >= 20 && pm < 40 },
  { id: "price-40-60", label: "40M – 60M Tshs", match: (pm) => pm >= 40 && pm < 60 },
  { id: "price-60-80", label: "60M – 80M Tshs", match: (pm) => pm >= 60 && pm < 80 },
  { id: "price-80-100", label: "80M – 100M Tshs", match: (pm) => pm >= 80 && pm < 100 },
  { id: "price-100-150", label: "100M – 150M Tshs", match: (pm) => pm >= 100 && pm < 150 },
  { id: "price-150-180", label: "150M – 180M Tshs", match: (pm) => pm >= 150 && pm < 180 },
  { id: "price-180-plus", label: "180M+", match: (pm) => pm >= 180 },
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

/** Shop mileage buckets (km); overlaps avoided at boundaries. */
const MILEAGE_BUCKETS: { id: string; label: string; match: (km: number) => boolean }[] = [
  { id: "mileage-0-20k", label: "0 km – 20,000 km", match: (km) => km >= 0 && km <= 20_000 },
  { id: "mileage-20k-30k", label: "20,000 km – 30,000 km", match: (km) => km > 20_000 && km <= 30_000 },
  { id: "mileage-30k-40k", label: "30,000 km – 40,000 km", match: (km) => km > 30_000 && km <= 40_000 },
  { id: "mileage-40k-50k", label: "40,000 km – 50,000 km", match: (km) => km > 40_000 && km <= 50_000 },
  { id: "mileage-over-50k", label: "Over 50,000 km", match: (km) => km > 50_000 },
]

function filterByMileageBucket(cars: Car[], bucketId: string | null): Car[] {
  if (!bucketId) return cars
  const bucket = MILEAGE_BUCKETS.find((b) => b.id === bucketId)
  if (!bucket) return cars
  return cars.filter((car) => {
    const km = parseMileageKm(car.mileage)
    if (km == null) return false
    return bucket.match(km)
  })
}

export function ShopContent({ cars, companyLogos = [] }: ShopContentProps) {
  const [activeType, setActiveType] = useState<string | null>(null)
  const [activeCondition, setActiveCondition] = useState<string | null>(null)
  const [activePriceRange, setActivePriceRange] = useState<string | null>(null)
  const [activeMileageRange, setActiveMileageRange] = useState<string | null>(null)
  const [activeLatest, setActiveLatest] = useState(false)
  const [activeRegistration, setActiveRegistration] = useState<string | null>(null)
  const [priceOpen, setPriceOpen] = useState(false)
  const [mileageOpen, setMileageOpen] = useState(false)
  const [typeOpen, setTypeOpen] = useState(false)
  const [makeOpen, setMakeOpen] = useState(true)
  const [listingOpen, setListingOpen] = useState(true)
  const [conditionOpen, setConditionOpen] = useState(true)
  const [selectedCompany, setSelectedCompany] = useState("")
  const [selectedBrand, setSelectedBrand] = useState("")
  const [selectedModel, setSelectedModel] = useState("")
  const [filterInDar, setFilterInDar] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [desktopFiltersVisible, setDesktopFiltersVisible] = useState(true)

  const hasActiveFilters =
    activeType !== null ||
    activeCondition !== null ||
    activePriceRange !== null ||
    activeMileageRange !== null ||
    activeLatest ||
    activeRegistration !== null ||
    !!selectedCompany ||
    !!selectedBrand ||
    !!selectedModel ||
    filterInDar

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

  // Model list filtered to only models that belong to the selected company/brand
  const modelOptions = useMemo(() => {
    let source = selectedCompany ? filterByCompany(cars, selectedCompany) : cars
    if (selectedBrand) source = filterByBrand(source, selectedBrand)
    const set = new Set<string>()
    source.forEach(car => { if (car.model) set.add(car.model) })
    return Array.from(set).sort()
  }, [cars, selectedCompany, selectedBrand])

  /** Type filters: built from live inventory so any new API `type` appears after normalizeCarType(). */
  const typeFilters = useMemo(() => buildShopTypeFilterRows(cars), [cars])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const company = params.get("company")
    const brand = params.get("brand")
    const model = params.get("model")
    const q = params.get("q")
    if (company) setSelectedCompany(decodeURIComponent(company))
    if (brand) setSelectedBrand(decodeURIComponent(brand))
    if (model) setSelectedModel(decodeURIComponent(model))
    if (q) setSearchQuery(decodeURIComponent(q))
    if (params.get("latest") === "1") setActiveLatest(true)
    if (params.get("in_dar") === "1") setFilterInDar(true)
    const price = params.get("price")
    if (price && PRICE_BUCKETS.some((b) => b.id === price)) setActivePriceRange(price)
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
    let filtered = filterByInDar(cars, filterInDar)
    filtered = filterByType(filtered, activeType)
    filtered = filterByCondition(filtered, activeCondition)
    filtered = filterByCompany(filtered, selectedCompany)
    filtered = filterByBrand(filtered, selectedBrand)
    filtered = filterByModel(filtered, selectedModel)
    if (activeLatest) filtered = filtered.filter((car) => isCarInLatestWindow(car.createdAt))

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((car) => {
        const searchText = `${car.name} ${car.year} ${car.fuel} ${car.transmission} ${car.description} ${car.company} ${car.brand}`.toLowerCase()
        return searchText.includes(query)
      })
    }

    return filtered
  }, [cars, filterInDar, activeType, activeCondition, selectedCompany, selectedBrand, selectedModel, activeLatest, searchQuery])

  const carsMatchingFiltersExceptPrice = useMemo(
    () => filterByRegistration(carsMatchingFiltersExceptPriceAndRegistration, activeRegistration),
    [carsMatchingFiltersExceptPriceAndRegistration, activeRegistration],
  )

  const carsMatchingPrice = useMemo(
    () => filterByPriceBucket(carsMatchingFiltersExceptPrice, activePriceRange),
    [carsMatchingFiltersExceptPrice, activePriceRange],
  )

  const filteredCars = useMemo(() => {
    const results = filterByMileageBucket(carsMatchingPrice, activeMileageRange)
    return [...results].sort((a, b) => {
      const ta = a.createdAt ? Date.parse(a.createdAt) : 0
      const tb = b.createdAt ? Date.parse(b.createdAt) : 0
      return tb - ta
    })
  }, [carsMatchingPrice, activeMileageRange])

  const shopTitle = filterInDar ? "Vehicles in Dar es Salaam" : "Shop All Vehicles"
  const shopSubtitle = filterInDar
    ? `Showing ${filteredCars.length} vehicle${filteredCars.length === 1 ? "" : "s"} available in Dar es Salaam`
    : `Browse our complete inventory of ${cars.length} quality vehicles`

  // Banner: use the selected company logo as the bg image (cross-fades to/from the default photo)
  const bannerLogoUrl = selectedCompany
    ? companyLogoMap.get(selectedCompany.trim().toLowerCase()) ?? null
    : null

  const handleClearFilters = () => {
    setActiveType(null)
    setActiveCondition(null)
    setActivePriceRange(null)
    setActiveMileageRange(null)
    setActiveLatest(false)
    setActiveRegistration(null)
    setPriceOpen(false)
    setMileageOpen(false)
    setTypeOpen(false)
    setSelectedCompany("")
    setSelectedBrand("")
    setSelectedModel("")
    setFilterInDar(false)
  }

  // When company changes, reset brand and model selection
  const handleCompanyChange = (value: string) => {
    setSelectedCompany(value === "__all__" ? "" : value)
    setSelectedBrand("")
    setSelectedModel("")
  }

  const handleBrandChange = (value: string) => {
    setSelectedBrand(value === "__all__" ? "" : value)
    setSelectedModel("")
  }

  const handleModelChange = (value: string) => {
    setSelectedModel(value === "__all__" ? "" : value)
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
  const activeMileageLabel = MILEAGE_BUCKETS.find((b) => b.id === activeMileageRange)?.label

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

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setMakeOpen((o) => !o)}
          className="flex w-full items-center justify-between py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>Shop by make</span>
          <ChevronDown
            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${makeOpen ? "rotate-180" : ""}`}
          />
        </button>

        {makeOpen && (
          <div className="flex flex-col gap-3 pt-1">
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

            <Select value={selectedModel || "__all__"} onValueChange={handleModelChange}>
              <SelectTrigger className="h-11 w-full rounded-xl border-border bg-card text-sm">
                <SelectValue placeholder="Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Models</SelectItem>
                {modelOptions.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
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

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setMileageOpen((o) => !o)}
          className="flex w-full items-center justify-between py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>Shop by mileage</span>
          <ChevronDown
            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${mileageOpen ? "rotate-180" : ""}`}
          />
        </button>

        {mileageOpen && (
          <div className="flex flex-col gap-2 pt-1">
            {MILEAGE_BUCKETS.map((bucket) => {
              const count = carsMatchingPrice.filter((car) => {
                const km = parseMileageKm(car.mileage)
                return km != null && bucket.match(km)
              }).length
              const isActive = activeMileageRange === bucket.id
              return (
                <Button
                  key={bucket.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setActiveMileageRange(isActive ? null : bucket.id)
                    if (!mileageOpen) setMileageOpen(true)
                  }}
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

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setListingOpen((o) => !o)}
          className="flex w-full items-center justify-between py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>Listing</span>
          <ChevronDown
            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${listingOpen ? "rotate-180" : ""}`}
          />
        </button>

        {listingOpen && (
          <div className="flex flex-col gap-2 pt-1">
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
        )}
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

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setConditionOpen((o) => !o)}
          className="flex w-full items-center justify-between py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>Condition</span>
          <ChevronDown
            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${conditionOpen ? "rotate-180" : ""}`}
          />
        </button>

        {conditionOpen && (
          <div className="flex flex-col gap-2 pt-1">
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
        )}
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
                Narrow the vehicle list by search, company, brand, price, mileage, listing, registration, type, and condition.
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

      {/* Mobile filters icon — sits in the header bar just left of the hamburger */}
      <button
        type="button"
        onClick={() => setMobileFiltersOpen(true)}
        className="lg:hidden fixed z-[60] pointer-events-auto right-14 top-[calc(env(safe-area-inset-top,0px)+0.5rem)] h-10 w-10 flex items-center justify-center rounded-full"
        aria-haspopup="dialog"
        aria-expanded={mobileFiltersOpen}
        aria-controls="shop-filters-sheet"
        aria-label="Open filters"
      >
        <SlidersHorizontal className="h-5 w-5 shrink-0 text-black" aria-hidden />
        {hasActiveFilters && (
          <span
            className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-white"
            aria-hidden
          />
        )}
      </button>

      {/* Mobile / tablet: hero banner card */}
      <div className="mb-6 mt-4 shrink-0 px-4 sm:px-6 lg:hidden">
        <div className="animate-fade-in-up">
          <div className="relative overflow-hidden rounded-2xl bg-black" style={{ height: "140px" }}>
            {/* Default car photo — fades out when a company logo is active */}
            <img
              src="/zenigame-photo-oaZ9WEVW7g8-unsplash.jpg"
              alt="Premium vehicle"
              className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700"
              style={{ opacity: bannerLogoUrl ? 0 : 1 }}
            />
            {/* Company logo layer — fades in when a company is selected */}
            {bannerLogoUrl && (
              <img
                key={bannerLogoUrl}
                src={bannerLogoUrl}
                alt={selectedCompany}
                className="absolute inset-0 h-full w-full object-contain object-center p-6 transition-opacity duration-700"
                style={{ opacity: bannerLogoUrl ? 1 : 0, background: "white" }}
              />
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" style={{ width: "70%" }} />
            <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent" />
            {/* Left: content */}
            <div className="relative z-10 flex h-full flex-col justify-center px-5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mb-1">
                {shopTitle}
              </h1>
              <p className="text-white/60 text-xs sm:text-sm">
                {shopSubtitle}
              </p>
            </div>
          </div>
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
          {/* Scroll target: hero + results count + car grid all scroll together */}
          <div
            id="shop-car-list-scroll"
            className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain pb-6"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
          {/* Desktop title: hero banner card */}
          <div className="hidden lg:block mb-4 pt-2 animate-fade-in-up">
            <div className="relative overflow-hidden rounded-2xl bg-black" style={{ height: "210px" }}>
              {/* Default car photo — fades out when a company logo is active */}
              <img
                src="/zenigame-photo-oaZ9WEVW7g8-unsplash.jpg"
                alt="Premium vehicle"
                className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700"
                style={{ opacity: bannerLogoUrl ? 0 : 1 }}
              />
              {/* Company logo layer — cross-fades in when a company is selected */}
              {bannerLogoUrl && (
                <img
                  key={bannerLogoUrl}
                  src={bannerLogoUrl}
                  alt={selectedCompany}
                  className="absolute inset-0 h-full w-full object-contain object-center p-10 transition-opacity duration-700"
                  style={{ opacity: bannerLogoUrl ? 1 : 0, background: "white" }}
                />
              )}
              {/* Gradient fade from black (left) to transparent (right) */}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent" />
              {/* Left: content */}
              <div className="relative z-10 flex h-full flex-col justify-center px-8">
                <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight mb-1.5">
                  {shopTitle}
                </h1>
                <p className="text-white/60 text-sm">
                  {shopSubtitle}
                </p>
              </div>
            </div>
          </div>

          <div
            id="results"
            className="mb-4 animate-fade-in"
            style={{ animationDelay: "0.1s", opacity: 0, animationFillMode: "forwards" }}
          >
            <p className="text-sm text-muted-foreground text-left">
              Showing {filteredCars.length} {filteredCars.length === 1 ? "vehicle" : "vehicles"}
              {activeTypeLabel && <span> · {activeTypeLabel}</span>}
              {activeConditionLabel && <span> · {activeConditionLabel}</span>}
              {activeRegistrationLabel && <span> · {activeRegistrationLabel}</span>}
              {activePriceLabel && <span> · {activePriceLabel}</span>}
              {activeMileageLabel && <span> · {activeMileageLabel}</span>}
              {filterInDar && <span> · Dar es Salaam</span>}
              {selectedCompany && <span> · {selectedCompany}</span>}
              {selectedBrand && <span> · {selectedBrand}</span>}
              {selectedModel && <span> · {selectedModel}</span>}
              {searchQuery && <span> matching &ldquo;{searchQuery}&rdquo;</span>}
            </p>
          </div>
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
