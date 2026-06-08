import type { Metadata } from "next"
import { HeaderWrapper } from "@/components/header-wrapper"
import { FooterWrapper } from "@/components/footer-wrapper"
import { CarDetailsContent } from "@/components/car-details-content"
import { getAllCars } from "@/lib/cars-data"
import { notFound } from "next/navigation"

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const allCars = await getAllCars()
  const car = allCars.find((c) => c.id === id)
  if (!car) return {}

  const yearPrefix = car.year ? `${car.year} ` : ""
  const title = `${yearPrefix}${car.name} — TG World International`
  const description = `${car.price}${car.mileage ? ` · ${car.mileage}` : ""}${car.fuel ? ` · ${car.fuel}` : ""}. Available at TG World International, Dar es Salaam.`
  const image = car.image?.startsWith("http") ? car.image : undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://tgworldtz.com/car/${id}`,
      siteName: "TG World International",
      ...(image && {
        images: [{ url: image, alt: `${yearPrefix}${car.name}` }],
      }),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image && { images: [image] }),
    },
  }
}

export default async function CarDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const allCars = await getAllCars()
  const car = allCars.find(c => c.id === id)

  if (!car) {
    notFound()
  }

  const relatedCars = allCars
    .filter(c =>
      c.id !== car.id &&
      c.category !== "sold-out" &&
      c.category !== "coming-soon" &&
      !!(car.company && c.company?.toLowerCase() === car.company.toLowerCase()) &&
      !!(car.type && c.type?.toLowerCase() === car.type.toLowerCase()) &&
      c.model !== car.model
    )
    .slice(0, 4)

  return (
    <main className="min-h-screen bg-background">
      <HeaderWrapper />
      <CarDetailsContent car={car} relatedCars={relatedCars} />
      <FooterWrapper />
    </main>
  )
}
