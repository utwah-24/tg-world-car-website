import { Hero } from "./hero"
import { getTopSellingCars } from "@/lib/cars-data"

export async function HeroWrapper() {
  // Fetch top selling cars to get a hero image
  const topCars = await getTopSellingCars()
  const heroImage = topCars[0]?.image || "/placeholder.svg"

  return <Hero heroImage={heroImage} />
}
