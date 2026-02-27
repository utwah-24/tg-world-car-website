import { HeaderWrapper } from "@/components/header-wrapper"
import { HeroWrapper } from "@/components/hero-wrapper"
import { CarSearchPage } from "@/components/car-search-page"
import { ContactSection } from "@/components/contact-section"
import { FooterWrapper } from "@/components/footer-wrapper"
import { getTopSellingCars, getComingSoonCars, getSoldOutCars } from "@/lib/cars-data"
import { fetchContent } from "@/lib/api"

// Revalidate this page every 60 seconds
export const revalidate = 60

export default async function Home() {
  // Fetch cars and content from API (with fallback to static data)
  const [topSellingCars, comingSoonCars, soldOutCars, contentVideos] = await Promise.all([
    getTopSellingCars(),
    getComingSoonCars(),
    getSoldOutCars(),
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
        contentVideos={contentVideos}
      />

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <FooterWrapper />
    </main>
  )
}
