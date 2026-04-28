"use client"

import { useState, useMemo } from "react"
import { Search, X } from "lucide-react"
import { ContentVideoCard } from "@/components/content-video-card"
import type { ContentVideo } from "@/lib/api"

interface ContentPageClientProps {
  videos: ContentVideo[]
}

export function ContentPageClient({ videos }: ContentPageClientProps) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return videos
    return videos.filter((v) => v.title.toLowerCase().includes(q))
  }, [videos, query])

  return (
    <>
      {/* Search bar */}
      <div className="relative max-w-md mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by car name…"
          className="w-full h-11 pl-10 pr-10 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-16 text-center">
          <p className="text-white/80 font-medium">No videos match &quot;{query}&quot;.</p>
          <p className="text-white/50 text-sm mt-2">Try a different car name.</p>
        </div>
      ) : (
        <>
          {query && (
            <p className="text-white/50 text-xs mb-4">
              {filtered.length} {filtered.length === 1 ? "result" : "results"} for &quot;{query}&quot;
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
            {filtered.map((video) => (
              <ContentVideoCard key={video.id} video={video} layout="grid" />
            ))}
          </div>
        </>
      )}
    </>
  )
}
