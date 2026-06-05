import { HeaderWrapper } from "@/components/header-wrapper"
import { FooterWrapper } from "@/components/footer-wrapper"
import { TestDriveContent } from "@/components/test-drive-content"
import { getAllCars } from "@/lib/cars-data"
import { notFound } from "next/navigation"

export const revalidate = 60

export default async function TestDrivePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const allCars = await getAllCars()
  const car = allCars.find((c) => c.id === id)

  if (!car || !car.testDriveAvailable) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background">
      <HeaderWrapper />
      <TestDriveContent car={car} />
      <FooterWrapper />
    </main>
  )
}
