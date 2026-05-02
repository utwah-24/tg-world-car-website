"use client"

import { useState, useMemo, useEffect } from "react"
import { ChevronDown } from "lucide-react"
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

export function InfoCards({ companies = [], companyLogos = [], cars = [] }: InfoCardsProps) {
  const [companyExpanded, setCompanyExpanded] = useState(false)
  /** Matches Tailwind grid: cols-2 / sm:3 / md:4 / lg:5 — mobile-first until resize runs. */
  const [columnsPerRow, setColumnsPerRow] = useState(2)

  useEffect(() => {
    const updateColumns = () => {
      const w = window.innerWidth
      if (w >= 1024) setColumnsPerRow(5)
      else if (w >= 768) setColumnsPerRow(4)
      else if (w >= 640) setColumnsPerRow(3)
      else setColumnsPerRow(2)
    }
    updateColumns()
    window.addEventListener("resize", updateColumns)
    return () => window.removeEventListener("resize", updateColumns)
  }, [])

  if (companies.length === 0) return null

  const sorted = [...companies].sort()
  const companySliceEnd = companyExpanded ? sorted.length : Math.min(columnsPerRow, sorted.length)
  const visibleCompanies = sorted.slice(0, companySliceEnd)
  const hasMoreCompanies = sorted.length > columnsPerRow

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
          {hasMoreCompanies && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setCompanyExpanded((v) => !v)}
                aria-expanded={companyExpanded}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${companyExpanded ? "rotate-180" : ""}`}
                  aria-hidden
                />
                {companyExpanded ? (
                  "Show fewer companies"
                ) : (
                  <>
                    Show all companies
                    <span className="text-muted-foreground font-normal tabular-nums">
                      ({sorted.length - columnsPerRow} more)
                    </span>
                  </>
                )}
              </button>
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
