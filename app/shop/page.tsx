import type { Metadata } from "next"
import { HeaderWrapper } from "@/components/header-wrapper"
import { ShopContent } from "@/components/shop-content"
import { AutoRefreshOnFocus } from "@/components/auto-refresh-on-focus"
import { getAllCars, getSoldCarsForShop, isCarAvailableNow } from "@/lib/cars-data"
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
  const count = allCars.filter((car) => {
    if (!isCarAvailableNow(car)) return false
    return (car.company ?? "").trim().toLowerCase() === normalised
  }).length

  const displayName = logoEntry?.company ?? companyParam
  const title = `${displayName} Vehicles | TG World`
  const description =
    count > 0
      ? `${count} ${displayName} ${count === 1 ? "vehicle" : "vehicles"} available at TG World International. Browse and shop now.`
      : `Browse ${displayName} vehicles at TG World International.`
  const pageUrl = `${SITE_URL}/shop?company=${encodeURIComponent(companyParam)}`

  // Build a server-rendered PNG via /api/og — converts the SVG logo to PNG so all
  // platforms (Telegram, WhatsApp, iMessage, etc.) can display it as the preview image.
  const ogImageParams = new URLSearchParams({ company: displayName })
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
      images: [{ url: ogImageUrl, width: 630, height: 630, alt: `${displayName} logo` }],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [ogImageUrl],
    },
  }
}

export default async function ShopPage() {
  const allCars = await getAllCars()
  const [companyLogos, soldCars] = await Promise.all([
    fetchCompanyLogos(),
    getSoldCarsForShop(allCars),
  ])

  const soldCarIds = new Set(soldCars.map((car) => car.id))

  // Exclude coming-soon/sold-out inventory and cars listed in /api/sold-cars.
  // Trust the API's is_coming_soon/is_sold fields — the backend already clears
  // coming-soon status once arrival_date passes, so no client-side date check.
  const availableCars = allCars.filter((car) => isCarAvailableNow(car) && !soldCarIds.has(car.id))

  const shopCars = [...availableCars, ...soldCars]

  return (
    <main className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-background">
      <AutoRefreshOnFocus />
      <HeaderWrapper />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-16 lg:pt-[4.5rem]">
        <ShopContent cars={shopCars} companyLogos={companyLogos} />
      </div>
    </main>
  )
}
