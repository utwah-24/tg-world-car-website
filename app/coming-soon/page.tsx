import { HeaderWrapper } from "@/components/header-wrapper"
import { ComingSoonContent } from "@/components/coming-soon-content"
import { getComingSoonCars } from "@/lib/cars-data"

export const revalidate = 0

export default async function ComingSoonPage() {
  const cars = await getComingSoonCars()

  return (
    <main className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-background">
      <HeaderWrapper />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-16 lg:pt-[4.5rem]">
        <ComingSoonContent cars={cars} />
      </div>
    </main>
  )
}
