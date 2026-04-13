import { HeaderWrapper } from "@/components/header-wrapper"
import { ShopContent } from "@/components/shop-content"
import { getAllCars } from "@/lib/cars-data"

export const revalidate = 0

export default async function ShopPage() {
  // Fetch all cars from API
  const allCars = await getAllCars()

  return (
    /* Fixed viewport height + no outer scroll — only the car list inside ShopContent scrolls */
    <main className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-background">
      <HeaderWrapper />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-16 lg:pt-[4.5rem]">
        <ShopContent cars={allCars} />
      </div>
    </main>
  )
}
