import { redirect } from "next/navigation"
import { HeaderWrapper } from "@/components/header-wrapper"
import { ComingSoonContent } from "@/components/coming-soon-content"
import { AutoRefreshOnFocus } from "@/components/auto-refresh-on-focus"
import { getComingSoonCars } from "@/lib/cars-data"

export const revalidate = 0

/** Matches the backend's `cars:clear-coming-soon` cron cadence. */
const COMING_SOON_POLL_MS = 5 * 60 * 1000

export default async function ComingSoonPage() {
  const cars = await getComingSoonCars()

  if (cars.length === 0) {
    redirect("/")
  }

  return (
    <main className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-background">
      <AutoRefreshOnFocus pollIntervalMs={COMING_SOON_POLL_MS} />
      <HeaderWrapper />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-16 lg:pt-[4.5rem]">
        <ComingSoonContent cars={cars} />
      </div>
    </main>
  )
}
