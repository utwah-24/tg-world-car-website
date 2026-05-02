"use client"

import { useState, useMemo, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  normalizeCarType,
  labelForCanonicalCarType,
  orderedCanonicalTypesInInventory,
  candidateCarTypeIconPaths,
} from "@/lib/car-type"

interface CompanyLogo {
  company: string
  logoUrl: string
}

interface CarItem {
  company?: string
  type?: string
}

interface InfoCardsProps {
  companies?: string[]
  companyLogos?: CompanyLogo[]
  cars?: CarItem[]
  /** When true, only the first grid row is shown until the user expands (main home content). */
  collapseCompanyGrid?: boolean
}

function useResponsiveCompanyGridColumns(): number {
  const [cols, setCols] = useState(5)
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w >= 1024) setCols(5)
      else if (w >= 768) setCols(4)
      else if (w >= 640) setCols(3)
      else setCols(2)
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])
  return cols
}

/** Renders a type icon, hiding itself silently when the image 404s. */
function TypeIcon({ canon, label }: { canon: string; label: string }) {
  const paths = useMemo(() => candidateCarTypeIconPaths(canon, label), [canon, label])
  const [srcIndex, setSrcIndex] = useState(0)

  useEffect(() => {
    setSrcIndex(0)
  }, [paths])

  if (srcIndex >= paths.length) return null

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={paths[srcIndex]}
      alt={label}
      width={40}
      height={40}
      className="object-contain w-full h-full"
      onError={() => setSrcIndex((i) => i + 1)}
    />
  )
}

export function InfoCards({
  companies = [],
  companyLogos = [],
  cars = [],
  collapseCompanyGrid = false,
}: InfoCardsProps) {
  const gridCols = useResponsiveCompanyGridColumns()
  const [companiesExpanded, setCompaniesExpanded] = useState(false)

  const sorted = useMemo(() => [...companies].sort(), [companies])

  const visibleCompanies = useMemo(() => {
    if (companies.length === 0) return []
    if (!collapseCompanyGrid || companiesExpanded || sorted.length <= gridCols) {
      return sorted
    }
    return sorted.slice(0, gridCols)
  }, [
    companies.length,
    collapseCompanyGrid,
    companiesExpanded,
    sorted,
    gridCols,
  ])

  const showCompanyExpand =
    collapseCompanyGrid && companies.length > 0 && sorted.length > gridCols

  const logoMap = new Map<string, string>()
  companyLogos.forEach(({ company, logoUrl }) => {
    logoMap.set(company.trim().toLowerCase(), logoUrl)
  })

  const companyCountMap = new Map<string, number>()
  cars.forEach((car) => {
    if (car.company) {
      const key = car.company.trim().toLowerCase()
      companyCountMap.set(key, (companyCountMap.get(key) ?? 0) + 1)
    }
  })

  const canonicalTypes = orderedCanonicalTypesInInventory(cars)
  const typeCountMap = new Map<string, number>()
  cars.forEach((car) => {
    const key = normalizeCarType(car.type || "")
    if (key) typeCountMap.set(key, (typeCountMap.get(key) ?? 0) + 1)
  })

  if (companies.length === 0) return null

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 border-b border-border">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Browse by Company */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Browse by Company
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {visibleCompanies.map((company) => {
              const key = company.trim().toLowerCase()
              const logoUrl = logoMap.get(key)
              const count = companyCountMap.get(key) ?? 0
              return (
                <a
                  key={company}
                  href={`/shop?company=${encodeURIComponent(company)}`}
                  className="flex items-center gap-3 py-3 px-4 rounded-xl border border-border hover:border-primary hover:bg-muted transition-all duration-150 group min-h-[52px]"
                >
                  <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-background border border-border/60 overflow-hidden">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoUrl}
                        alt={company}
                        width={40}
                        height={40}
                        className="object-contain w-full h-full p-1"
                      />
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground uppercase">
                        {company.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate leading-tight">
                      {company}
                    </span>
                    {count > 0 && (
                      <span className="text-xs text-muted-foreground leading-tight">
                        {count} {count === 1 ? "car" : "cars"}
                      </span>
                    )}
                  </div>
                </a>
              )
            })}
          </div>
          {showCompanyExpand && (
            <div className="mt-4 flex justify-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2 rounded-full text-muted-foreground hover:text-foreground"
                aria-expanded={companiesExpanded}
                onClick={() => setCompaniesExpanded((e) => !e)}
              >
                <ChevronDown
                  className={`h-5 w-5 transition-transform duration-200 ${companiesExpanded ? "rotate-180" : ""}`}
                  aria-hidden
                />
                <span className="text-sm font-medium">
                  {companiesExpanded ? "Show fewer companies" : "Show all companies"}
                </span>
              </Button>
            </div>
          )}
        </div>

        {/* Browse by Car Type */}
        {canonicalTypes.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Browse by Car Type
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {canonicalTypes.map((canon) => {
                const label = labelForCanonicalCarType(canon)
                const count = typeCountMap.get(canon) ?? 0
                return (
                  <a
                    key={canon}
                    href={`/shop?category=${encodeURIComponent(canon)}`}
                    className="flex items-center gap-3 py-3 px-4 rounded-xl border border-border hover:border-primary hover:bg-muted transition-all duration-150 group min-h-[52px]"
                  >
                    <div className="shrink-0 w-10 h-10 flex items-center justify-center overflow-hidden">
                      <TypeIcon canon={canon} label={label} />
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate leading-tight">
                        {label}
                      </span>
                      {count > 0 && (
                        <span className="text-xs text-muted-foreground leading-tight">
                          {count} {count === 1 ? "car" : "cars"}
                        </span>
                      )}
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  )
}
