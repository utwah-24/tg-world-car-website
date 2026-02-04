import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { CarSection } from "@/components/car-section"
import { FeaturesSection } from "@/components/features-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { getTopSellingCars, getComingSoonCars, getSoldOutCars } from "@/lib/cars-data"

export default function Home() {
  const topSellingCars = getTopSellingCars()
  const comingSoonCars = getComingSoonCars()
  const soldOutCars = getSoldOutCars()

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      
      {/* Popular Cars Near You */}
      <CarSection
        id="popular"
        title="Popular cars near you"
        subtitle="Browse cars by category to find what suits you best."
        cars={topSellingCars}
        showFilters
        showBadge
        badgeText="Best Seller"
        badgeVariant="default"
      />

      {/* Features Section */}
      <FeaturesSection />

      {/* Top Picks for You */}
      <CarSection
        id="top-picks"
        title="Top Picks for You"
        subtitle="Explore the most popular listings handpicked from trusted sellers."
        cars={comingSoonCars}
      />

      {/* Recently Sold */}
      <CarSection
        id="sold"
        title="Recently Sold"
        subtitle="These exceptional vehicles have found their new homes. Browse to see the quality we deliver."
        cars={soldOutCars}
      />

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <Footer />
    </main>
  )
}
