import { HeaderWrapper } from "@/components/header-wrapper"
import { FooterWrapper } from "@/components/footer-wrapper"
import { ShopContent } from "@/components/shop-content"
import { getAllCars } from "@/lib/cars-data"

export const revalidate = 60

export default async function ShopPage() {
  // Fetch all cars from API
  const allCars = await getAllCars()

  return (
    <main className="min-h-screen bg-background">
      <HeaderWrapper />
      <ShopContent cars={allCars} />
      <FooterWrapper />
    </main>
  )
}
