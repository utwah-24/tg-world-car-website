import { HeaderWrapper } from "@/components/header-wrapper"
import { ShopContent } from "@/components/shop-content"
import { getAllCars } from "@/lib/cars-data"
import { fetchCompanyLogos } from "@/lib/api"

export const revalidate = 0

export default async function ShopPage() {
  const [allCars, companyLogos] = await Promise.all([getAllCars(), fetchCompanyLogos()])

  // Exclude cars that are still waiting to arrive (arrivalDate in the future) or are sold out
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const shopCars = allCars.filter((car) => {
    // Hide sold-out cars completely
    if (car.category === "sold-out") return false
    // Hide coming-soon cars whose arrival date hasn't been reached yet
    if (car.arrivalDate) {
      const arrival = new Date(car.arrivalDate)
      arrival.setHours(0, 0, 0, 0)
      return arrival <= today
    }
    return true
  })

  return (
    /* Fixed viewport height + no outer scroll — only the car list inside ShopContent scrolls */
    <main className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-background">
      <HeaderWrapper />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-16 lg:pt-[4.5rem]">
        <ShopContent cars={shopCars} companyLogos={companyLogos} />
      </div>
    </main>
  )
}
