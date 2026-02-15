"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

interface SearchBoxProps {
  onSearch?: (query: string) => void
}

export function SearchBox({ onSearch }: SearchBoxProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery)
    }
    // Scroll to results
    const element = document.getElementById("search-results")
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const handleClear = () => {
    setSearchQuery("")
    if (onSearch) {
      onSearch("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-6 border border-border">
          {/* Search Input */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by car name, make, model, or year (e.g., Toyota Land Cruiser 2024)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-14 pl-12 pr-12 text-base rounded-xl border-border bg-muted/50"
              />
              {searchQuery && (
                <button
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <Button 
              onClick={handleSearch}
              className="h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-base font-medium whitespace-nowrap"
            >
              <Search className="w-5 h-5 mr-2" />
              Search Cars
            </Button>
          </div>
          
          {/* Search Tips */}
          {!searchQuery && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Try searching: "Land Cruiser", "2024 Range Rover", "Fortuner", "Subaru"
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
