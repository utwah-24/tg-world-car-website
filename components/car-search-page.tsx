"use client"

import { useState, useMemo } from "react"
import { SearchBox } from "./search-box"
import { InfoCards } from "./info-cards"
import { CarSection } from "./car-section"
import { ContentReviewsSection } from "./content-reviews-section"
import type { Car } from "@/lib/cars-data"
import type { ContentVideo } from "@/lib/api"

interface CarSearchPageProps {
  topSellingCars: Car[]
  comingSoonCars: Car[]
  soldOutCars: Car[]
  contentVideos: ContentVideo[]
}

export function CarSearchPage({ topSellingCars, comingSoonCars, soldOutCars, contentVideos }: CarSearchPageProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Combine all cars for searching
  const allCars = useMemo(() => {
    return [...topSellingCars, ...comingSoonCars, ...soldOutCars]
  }, [topSellingCars, comingSoonCars, soldOutCars])

  // Filter cars based on search query
  const filteredCars = useMemo(() => {
    if (!searchQuery.trim()) {
      return null // Return null to show all categories
    }

    const query = searchQuery.toLowerCase().trim()
    return allCars.filter(car => {
      const searchText = `${car.name} ${car.year} ${car.fuel} ${car.transmission} ${car.description}`.toLowerCase()
      return searchText.includes(query)
    })
  }, [searchQuery, allCars])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <>
      {/* Search Box */}
      <SearchBox onSearch={handleSearch} />

      {/* Info Cards Section */}
      <InfoCards />
      
      {/* Search Results or Category Sections */}
      {filteredCars !== null ? (
        // Show search results
        <div id="search-results">
          <CarSection
            id="search-results"
            title={`Search Results for "${searchQuery}"`}
            subtitle={`Found ${filteredCars.length} ${filteredCars.length === 1 ? 'car' : 'cars'} matching your search`}
            cars={filteredCars}
          />
          {filteredCars.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No cars found matching "{searchQuery}". Try a different search term.
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
            showFilters
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
