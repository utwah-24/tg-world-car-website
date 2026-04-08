"use client"

import { useState, useMemo } from "react"
import { SearchBox } from "./search-box"
import { InfoCards } from "./info-cards"
import { CarSection } from "./car-section"
import { ContentReviewsSection } from "./content-reviews-section"
import type { Car } from "@/lib/cars-data"
import type { ContentVideo, CompanyLogo } from "@/lib/api"

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

          {/* Content Reviews Section - Right after Popular Cars */}
          {contentVideos.length > 0 && (
            <ContentReviewsSection videos={contentVideos} />
          )}

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
        </>
      )}
    </>
  )
}
