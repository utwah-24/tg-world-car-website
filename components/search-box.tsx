"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { buildCompanyLogoMap, CompanyOptionRow } from "@/components/company-select-option"
import type { Car } from "@/lib/cars-data"
import type { CompanyLogo } from "@/lib/api"
import { Search, X } from "lucide-react"

interface SearchBoxProps {
  cars?: Car[]
  companyLogos?: CompanyLogo[]
  selectedCompany?: string
  selectedBrand?: string
  onSearch?: (query: string) => void
  onCompanyChange?: (company: string) => void
  onBrandChange?: (brand: string) => void
}

export function SearchBox({
  cars = [],
  companyLogos = [],
  selectedCompany = "",
  selectedBrand = "",
  onSearch,
  onCompanyChange,
  onBrandChange,
}: SearchBoxProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const companyOptions = useMemo(() => {
    const set = new Set<string>()
    cars.forEach(car => { if (car.company) set.add(car.company) })
    return Array.from(set).sort()
  }, [cars])

  const companyLogoMap = useMemo(() => buildCompanyLogoMap(companyLogos), [companyLogos])

  const brandOptions = useMemo(() => {
    const source = selectedCompany
      ? cars.filter(c => (c.company || "").toLowerCase() === selectedCompany.toLowerCase())
      : cars
    const set = new Set<string>()
    source.forEach(car => { if (car.brand) set.add(car.brand) })
    return Array.from(set).sort()
  }, [cars, selectedCompany])

  const handleSearch = () => {
    onSearch?.(searchQuery)
    document.getElementById("search-results")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleClear = () => {
    setSearchQuery("")
    onSearch?.("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch()
  }

  const handleCompanyChange = (value: string) => {
    const company = value === "__all__" ? "" : value
    onCompanyChange?.(company)
    onBrandChange?.("")   // reset brand when company changes
  }

  const handleBrandChange = (value: string) => {
    onBrandChange?.(value === "__all__" ? "" : value)
  }

  const hasAnyFilter = !!searchQuery || !!selectedCompany || !!selectedBrand

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-6 border border-border">

          {/* Row 1: Search + Search button */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by car name, make, model, or year…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-14 pl-12 pr-12 text-base rounded-xl border-border bg-muted/50"
              />
              {searchQuery && (
                <button
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <Button
              onClick={handleSearch}
              className="h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-base font-medium whitespace-nowrap"
            >
              <Search className="w-5 h-5 mr-2" />
              Search Cars
            </Button>
          </div>

          {/* Row 2: Company + Brand dropdowns */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedCompany || "__all__"} onValueChange={handleCompanyChange}>
              <SelectTrigger className="h-11 flex-1 rounded-xl border-border bg-muted/50 text-sm [&>span]:flex [&>span]:min-w-0 [&>span]:items-center [&>span]:gap-2.5 [&>span]:line-clamp-none">
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Companies</SelectItem>
                {companyOptions.map((c) => (
                  <SelectItem key={c} value={c} className="py-2 pr-2">
                    <CompanyOptionRow name={c} logoMap={companyLogoMap} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedBrand || "__all__"} onValueChange={handleBrandChange}>
              <SelectTrigger className="h-11 flex-1 rounded-xl border-border bg-muted/50 text-sm">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Brands</SelectItem>
                {brandOptions.map(b => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tips / active filter hint */}
          {!hasAnyFilter && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Try searching: &ldquo;Land Cruiser&rdquo;, &ldquo;2024 Range Rover&rdquo;, &ldquo;Fortuner&rdquo;, &ldquo;Subaru&rdquo;
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
