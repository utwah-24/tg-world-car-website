import { HeaderWrapper } from "@/components/header-wrapper"
import { HeroWrapper } from "@/components/hero-wrapper"
import { CarSearchPage } from "@/components/car-search-page"
import { ContactSection } from "@/components/contact-section"
import { FooterWrapper } from "@/components/footer-wrapper"
import { getTopSellingCars, getComingSoonCars, getSoldOutCars, getAllCars } from "@/lib/cars-data"
import { fetchContent } from "@/lib/api"

export const revalidate = 0

export default async function Home() {
  const [topSellingCars, comingSoonCars, soldOutCars, allCars, contentVideos] = await Promise.all([
    getTopSellingCars(),
    getComingSoonCars(),
    getSoldOutCars(),
    getAllCars(),
    fetchContent(),
  ])

  return (
    <main className="min-h-screen bg-background">
      <HeaderWrapper />
      <HeroWrapper />
      
      {/* Car Search and Display */}
      <CarSearchPage 
        topSellingCars={topSellingCars}
        comingSoonCars={comingSoonCars}
        soldOutCars={soldOutCars}
        allCars={allCars}
        contentVideos={contentVideos}
      />

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <FooterWrapper />
    </main>
  )
}
