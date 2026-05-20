"use client"

import { useState, useMemo } from "react"
import { SearchBox } from "./search-box"
import { InfoCards } from "./info-cards"
import { CarSection } from "./car-section"
import { ContentReviewsSection } from "./content-reviews-section"
import { HomeSlotsSection } from "./home-slots-section"
import type { Car } from "@/lib/cars-data"
import type { ContentVideo, CompanyLogo } from "@/lib/api"
import { filterLatestCars } from "@/lib/latest-cars"

interface CarSearchPageProps {
  topSellingCars: Car[]
  comingSoonCars: Car[]
  soldOutCars: Car[]
  allCars: Car[]
  contentVideos: ContentVideo[]
  companyLogos?: CompanyLogo[]
}

export function CarSearchPage({ topSellingCars, comingSoonCars, soldOutCars, allCars, contentVideos, companyLogos = [] }: CarSearchPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCompany, setSelectedCompany] = useState("")
  const [selectedBrand, setSelectedBrand] = useState("")

  // All cars combined for search (uses category-split lists)
  const searchableCars = useMemo(() => {
    return [...topSellingCars, ...comingSoonCars, ...soldOutCars]
  }, [topSellingCars, comingSoonCars, soldOutCars])

  // Only truly available cars: exclude sold-out and coming-soon for counts/company list
  const availableForBrowse = useMemo(() => {
    return allCars.filter(
      (car) => car.category !== "sold-out" && car.category !== "coming-soon",
    )
  }, [allCars])

  // Companies derived only from available cars so sold-out-only brands don't appear
  const companies = useMemo(() => {
    const set = new Set<string>()
    availableForBrowse.forEach(car => { if (car.company) set.add(car.company) })
    return Array.from(set)
  }, [availableForBrowse])

  /** New listings: stay in this section for 30 days after upload (from API created_at).
   *  Coming-soon cars (arrivalDate set) are excluded — they belong to the Coming Soon page. */
  const latestCars = useMemo(() => {
    // Only cars that were recently uploaded, are not coming-soon, and are not sold
    const recent = filterLatestCars(allCars).filter(
      (car) => !car.arrivalDate && car.category !== "sold-out",
    )

    return recent.slice(0, 5) // one row at 5-column desktop grid
  }, [allCars])

  const hasFilters = !!searchQuery.trim() || !!selectedCompany || !!selectedBrand

  // Filter cars based on search query + company + brand
  const filteredCars = useMemo(() => {
    if (!hasFilters) return null // null = show all category sections

    let result = searchableCars

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(car => {
        const searchText = `${car.name} ${car.year} ${car.fuel} ${car.transmission} ${car.description} ${car.company} ${car.brand}`.toLowerCase()
        return searchText.includes(query)
      })
    }

    if (selectedCompany) {
      result = result.filter(car => (car.company || "").toLowerCase() === selectedCompany.toLowerCase())
    }

    if (selectedBrand) {
      result = result.filter(car => (car.brand || "").toLowerCase() === selectedBrand.toLowerCase())
    }

    return result
  }, [searchQuery, selectedCompany, selectedBrand, allCars, hasFilters])

  const activeLabel = [
    searchQuery.trim() ? `"${searchQuery}"` : "",
    selectedCompany,
    selectedBrand,
  ].filter(Boolean).join(" · ")

  return (
    <>
      {/* Coming Soon */}
      {!hasFilters && <HomeSlotsSection />}

      {/* Search Box */}
      <SearchBox
        cars={searchableCars}
        companyLogos={companyLogos}
        selectedCompany={selectedCompany}
        selectedBrand={selectedBrand}
        onSearch={setSearchQuery}
        onCompanyChange={setSelectedCompany}
        onBrandChange={setSelectedBrand}
      />

      {/* Brand grid */}
      <InfoCards
        companies={companies}
        companyLogos={companyLogos}
        cars={availableForBrowse}
        collapseCompanyGrid
      />
      
      {/* Search Results or Category Sections */}
      {filteredCars !== null ? (
        // Show search results
        <div id="search-results">
          <CarSection
            id="search-results"
            title={`Results for ${activeLabel}`}
            subtitle={`Found ${filteredCars.length} ${filteredCars.length === 1 ? "car" : "cars"} matching your search`}
            cars={filteredCars}
            seeMoreHref={`/shop?${new URLSearchParams([
              ...(searchQuery.trim() ? [["q", searchQuery.trim()]] : []),
              ...(selectedCompany ? [["company", selectedCompany]] : []),
              ...(selectedBrand ? [["brand", selectedBrand]] : []),
            ]).toString()}`}
          />
          {filteredCars.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No cars found matching {activeLabel}. Try a different search term or filter.
              </p>
            </div>
          )}
        </div>
      ) : (
        // Show all category sections
        <>
          {/* Coming Soon — first 5 cars teaser above Latest */}
          {comingSoonCars.length > 0 && (
            <CarSection
              id="coming-soon-preview"
              title="Coming Soon"
              subtitle="Cars arriving soon — reserve yours before they land."
              cars={comingSoonCars}
              maxCars={5}
              showBadge
              badgeText="Coming Soon"
              badgeVariant="default"
              seeMoreHref="/coming-soon"
              variant="dark"
              minimalCarCards
              mobileMaxCars={4}
            />
          )}

          {/* Latest cars — anchor #latest always exists for header nav */}
          {latestCars.length > 0 ? (
            <CarSection
              id="latest"
              title="Latest cars"
              subtitle=""
              cars={latestCars}
              showBadge
              badgeText="Just Added"
              badgeVariant="default"
              seeMoreHref="/shop?latest=1"
              mobileMaxCars={4}
            />
          ) : (
            <section id="latest" className="scroll-mt-20 lg:scroll-mt-24 py-10 lg:py-12" aria-label="Latest cars">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
                No listings from the last 30 days right now — browse Popular or Top Picks below.
              </div>
            </section>
          )}

          {/* Top selling cars */}
          <CarSection
            id="popular"
            title="Top selling cars "
            subtitle="Browse cars by category to find what suits you best."
            cars={topSellingCars}
            maxCars={5}
            showBadge
            badgeText="Best Seller"
            badgeVariant="default"
            mobileMaxCars={4}
            seeMoreHref="/shop"
            variant="gold"
          />

          {/* Content — #content anchor always present for header nav */}
          {contentVideos.length > 0 ? (
            <ContentReviewsSection videos={contentVideos} />
          ) : (
            <section
              id="content"
              className="scroll-mt-20 lg:scroll-mt-24 py-12 lg:py-16 bg-black border-t border-white/5"
              aria-label="Video content"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white/50 text-sm">
                Video reviews will appear here when available.
              </div>
            </section>
          )}

          {/* Top Picks for You */}
          <CarSection
            id="top-picks"
            title="Top Picks for You"
            subtitle="Explore the most popular listings handpicked from trusted sellers."
            cars={comingSoonCars}
          />
        </>
      )}
    </>
  )
}
