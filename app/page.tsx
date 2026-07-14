import { HeaderWrapper } from "@/components/header-wrapper"
import { HeroWrapper } from "@/components/hero-wrapper"
import { CarSearchPage } from "@/components/car-search-page"
import { ContactSection } from "@/components/contact-section"
import { ConnectWithUsSection } from "@/components/connect-with-us-section"
import { FooterWrapper } from "@/components/footer-wrapper"
import { AutoRefreshOnFocus } from "@/components/auto-refresh-on-focus"
import { getTopSellingCars, getComingSoonCars, getSoldOutCars, getAllCars } from "@/lib/cars-data"
import { fetchContent, fetchCompanyLogos, fetchPromotions } from "@/lib/api"
import { getActivePromotionsFromList } from "@/lib/promotions"

export const revalidate = 0

export default async function Home() {
  const [topSellingCars, comingSoonCars, soldOutCars, allCars, contentVideos, companyLogos, promotions] = await Promise.all([
    getTopSellingCars(),
    getComingSoonCars(),
    getSoldOutCars(),
    getAllCars(),
    fetchContent(),
    fetchCompanyLogos(),
    fetchPromotions(),
  ])

  const activePromotions = getActivePromotionsFromList(promotions)

  return (
    <main className="min-h-screen bg-background">
      <AutoRefreshOnFocus />
      <HeaderWrapper />
      <HeroWrapper />
      
      {/* Car Search and Display */}
      <CarSearchPage 
        topSellingCars={topSellingCars}
        comingSoonCars={comingSoonCars}
        soldOutCars={soldOutCars}
        allCars={allCars}
        contentVideos={contentVideos}
        companyLogos={companyLogos}
        promotions={activePromotions}
      />

      {/* Contact Section */}
      <ContactSection />

      <ConnectWithUsSection />

      {/* Footer */}
      <FooterWrapper />
    </main>
  )
}
