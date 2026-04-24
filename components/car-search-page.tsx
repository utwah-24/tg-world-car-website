"use client"

import { useState, useMemo } from "react"
import { SearchBox } from "./search-box"
import { InfoCards } from "./info-cards"
import { CarSection } from "./car-section"
import { ContentReviewsSection } from "./content-reviews-section"
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

  // Companies always derived from the FULL car list directly from the DB
  const companies = useMemo(() => {
    const set = new Set<string>()
    allCars.forEach(car => { if (car.company) set.add(car.company) })
    return Array.from(set)
  }, [allCars])

  /** New listings: stay in this section for 30 days after upload (from API created_at) */
  const latestCars = useMemo(() => {
    const list = filterLatestCars(allCars)
    return list.slice(0, 6)
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
      <InfoCards companies={companies} companyLogos={companyLogos} />
      
      {/* Search Results or Category Sections */}
      {filteredCars !== null ? (
        // Show search results
        <div id="search-results">
          <CarSection
            id="search-results"
            title={`Results for ${activeLabel}`}
            subtitle={`Found ${filteredCars.length} ${filteredCars.length === 1 ? "car" : "cars"} matching your search`}
            cars={filteredCars}
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
          {/* Latest cars — anchor #latest always exists for header nav */}
          {latestCars.length > 0 ? (
            <CarSection
              id="latest"
              title="Latest cars"
              subtitle="New listings from the last 30 days. Each vehicle stays here for one month after it goes live."
              cars={latestCars}
              showBadge
              badgeText="New"
              badgeVariant="default"
            />
          ) : (
            <section id="latest" className="scroll-mt-20 lg:scroll-mt-24 py-10 lg:py-12" aria-label="Latest cars">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
                No listings from the last 30 days right now — browse Popular or Top Picks below.
              </div>
            </section>
          )}

          {/* Popular Cars */}
          <CarSection
            id="popular"
            title="Popular cars"
            subtitle="Browse cars by category to find what suits you best."
            cars={topSellingCars}
            maxCars={6}
            showBadge
            badgeText="Best Seller"
            badgeVariant="default"
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
