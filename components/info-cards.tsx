"use client"

import { useState } from "react"
import {
  normalizeCarType,
  labelForCanonicalCarType,
  orderedCanonicalTypesInInventory,
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

/**
 * Derive candidate icon paths from the canonical type key.
 * Tries: canonical key as-is, canonical with underscores→spaces, and lowercased label.
 * The <img> onError handler will hide the image if none resolve to a real file.
 */
function candidateIconPaths(canon: string, label: string): string[] {
  const candidates = new Set<string>()
  candidates.add(`/icons/${canon}.png`)
  candidates.add(`/icons/${canon.replace(/_/g, " ")}.png`)
  candidates.add(`/icons/${label.toLowerCase()}.png`)
  return Array.from(candidates)
}

/** Renders a type icon, hiding itself silently when the image 404s. */
function TypeIcon({ canon, label }: { canon: string; label: string }) {
  const paths = candidateIconPaths(canon, label)
  const [srcIndex, setSrcIndex] = useState(0)
  const [failed, setFailed] = useState(false)

  if (failed) return null

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={paths[srcIndex]}
      alt={label}
      width={40}
      height={40}
      className="object-contain w-full h-full"
      onError={() => {
        if (srcIndex + 1 < paths.length) {
          setSrcIndex(srcIndex + 1)
        } else {
          setFailed(true)
        }
      }}
    />
  )
}

export function InfoCards({ companies = [], companyLogos = [], cars = [] }: InfoCardsProps) {
  if (companies.length === 0) return null

  const sorted = [...companies].sort()

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
            {sorted.map((company) => {
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
