"use client"

import Image from "next/image"
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
    <span className="flex min-w-0 items-center gap-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-background">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt=""
            width={28}
            height={28}
            className="h-full w-full object-contain p-0.5"
            unoptimized
          />
        ) : (
          <span className="text-[10px] font-bold text-muted-foreground">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1 truncate text-left font-normal">{name}</span>
    </span>
  )
}
