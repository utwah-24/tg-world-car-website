import { HeaderWrapper } from "@/components/header-wrapper"
import { FooterWrapper } from "@/components/footer-wrapper"
import { ProfileContent } from "@/components/profile-content"
import { getAllCars } from "@/lib/cars-data"

export const metadata = {
  title: "My Profile | TG World",
  description: "View your TG World account, purchases, and favorite vehicles.",
}

export default async function ProfilePage() {
  const cars = await getAllCars()

  return (
    <main className="min-h-screen bg-background">
      <HeaderWrapper />
      <div className="pt-16 lg:pt-18">
        <ProfileContent cars={cars} />
      </div>
      <FooterWrapper />
    </main>
  )
}
