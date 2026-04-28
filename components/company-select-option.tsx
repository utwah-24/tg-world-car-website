"use client"

import type { CompanyLogo } from "@/lib/api"

export function buildCompanyLogoMap(companyLogos: CompanyLogo[]) {
  const m = new Map<string, string>()
  for (const { company, logoUrl } of companyLogos) {
    m.set(company.trim().toLowerCase(), logoUrl)
  }
  return m
}

export function CompanyOptionRow({
  name,
  logoMap,
}: {
  name: string
  logoMap: Map<string, string>
}) {
  const logoUrl = logoMap.get(name.trim().toLowerCase())
  return (
    <span className="inline-flex w-full min-w-0 items-center gap-2.5">
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-background">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            width={24}
            height={24}
            className="h-full w-full object-contain p-0.5"
          />
        ) : (
          <span className="text-[10px] font-bold text-muted-foreground leading-none">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1 truncate text-left font-normal">{name}</span>
    </span>
  )
}
