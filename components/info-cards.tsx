"use client"

import Image from "next/image"

interface CompanyLogo {
  company: string
  logoUrl: string
}

interface InfoCardsProps {
  companies?: string[]
  companyLogos?: CompanyLogo[]
}

export function InfoCards({ companies = [], companyLogos = [] }: InfoCardsProps) {
  if (companies.length === 0) return null

  const sorted = [...companies].sort()

  const logoMap = new Map<string, string>()
  companyLogos.forEach(({ company, logoUrl }) => {
    logoMap.set(company.trim().toLowerCase(), logoUrl)
  })

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 border-b border-border">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Browse by Company
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {sorted.map((company) => {
            const logoUrl = logoMap.get(company.trim().toLowerCase())
            return (
              <a
                key={company}
                href={`/shop?company=${encodeURIComponent(company)}`}
                className="flex items-center gap-3 py-3 px-4 rounded-xl border border-border hover:border-primary hover:bg-muted transition-all duration-150 group min-h-[52px]"
              >
                <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-background border border-border/60 overflow-hidden">
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt={company}
                      width={40}
                      height={40}
                      className="object-contain w-full h-full p-1"
                      unoptimized
                    />
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                      {company.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                  {company}
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
