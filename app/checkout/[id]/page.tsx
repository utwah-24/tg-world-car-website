import { HeaderWrapper } from "@/components/header-wrapper"
import { FooterWrapper } from "@/components/footer-wrapper"
import { CheckoutContent } from "@/components/checkout-content"
import { getAllCars } from "@/lib/cars-data"
import { notFound } from "next/navigation"

export const revalidate = 60

export default async function CheckoutPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Await params in Next.js 15+
  const { id } = await params
  
  // Fetch all cars to find the specific one
  const allCars = await getAllCars()
  const car = allCars.find(c => c.id === id)

  if (!car) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background">
      <HeaderWrapper />
      <CheckoutContent car={car} />
      <FooterWrapper />
    </main>
  )
}
