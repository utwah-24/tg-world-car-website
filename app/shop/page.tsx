import type { Metadata } from "next"
import { HeaderWrapper } from "@/components/header-wrapper"
import { ShopContent } from "@/components/shop-content"
import { getAllCars } from "@/lib/cars-data"
import { fetchCompanyLogos } from "@/lib/api"

export const revalidate = 0

const SITE_URL = "https://tgworldtz.com"
const DEFAULT_OG_IMAGE = `${SITE_URL}/tg-world_dark_logo.jpg`

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const params = await searchParams
  const companyParam = typeof params.company === "string" ? params.company.trim() : null

  if (!companyParam) {
    return {
      title: "Shop All Vehicles | TG World",
      description: "Browse our full inventory of quality vehicles at TG World International.",
      openGraph: {
        title: "Shop All Vehicles | TG World International",
        description: "Browse our full inventory of quality vehicles at TG World International.",
        url: `${SITE_URL}/shop`,
        siteName: "TG World International",
        images: [{ url: DEFAULT_OG_IMAGE, width: 1080, height: 756, alt: "TG World International" }],
        locale: "en_US",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: "Shop All Vehicles | TG World International",
        description: "Browse our full inventory of quality vehicles at TG World International.",
        images: [DEFAULT_OG_IMAGE],
      },
    }
  }

  // Fetch logos + cars in parallel
  const [logos, allCars] = await Promise.all([fetchCompanyLogos(), getAllCars()])

  const normalised = companyParam.toLowerCase()

  // Find the logo for this company
  const logoEntry = logos.find((l) => l.company.trim().toLowerCase() === normalised)

  // Count available cars for this company (exclude sold-out / coming-soon)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const count = allCars.filter((car) => {
    if (car.category === "sold-out") return false
    if (car.arrivalDate) {
      const arrival = new Date(car.arrivalDate)
      arrival.setHours(0, 0, 0, 0)
      if (arrival > today) return false
    }
    return (car.company ?? "").trim().toLowerCase() === normalised
  }).length

  const displayName = logoEntry?.company ?? companyParam
  const title = `${displayName} Vehicles | TG World`
  const description =
    count > 0
      ? `${count} ${displayName} ${count === 1 ? "vehicle" : "vehicles"} available at TG World International. Browse and shop now.`
      : `Browse ${displayName} vehicles at TG World International.`
  const pageUrl = `${SITE_URL}/shop?company=${encodeURIComponent(companyParam)}`

  // Build a server-rendered PNG OG image via /api/og (1200×630, works on all platforms).
  // The route fetches the SVG logo, embeds it in a branded card, and returns a proper PNG.
  const ogImageParams = new URLSearchParams({ company: displayName, count: String(count) })
  if (logoEntry?.logoUrl) ogImageParams.set("logo", logoEntry.logoUrl)
  const ogImageUrl = `${SITE_URL}/api/og?${ogImageParams.toString()}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "TG World International",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${displayName} – TG World` }],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  }
}

export default async function ShopPage() {
  const [allCars, companyLogos] = await Promise.all([getAllCars(), fetchCompanyLogos()])

  // Exclude cars that are still waiting to arrive (arrivalDate in the future) or are sold out
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const shopCars = allCars.filter((car) => {
    if (car.category === "sold-out") return false
    if (car.arrivalDate) {
      const arrival = new Date(car.arrivalDate)
      arrival.setHours(0, 0, 0, 0)
      return arrival <= today
    }
    return true
  })

  return (
    <main className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-background">
      <HeaderWrapper />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-16 lg:pt-[4.5rem]">
        <ShopContent cars={shopCars} companyLogos={companyLogos} />
      </div>
    </main>
  )
}
