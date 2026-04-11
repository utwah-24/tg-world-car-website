"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { ContentVideo } from "@/lib/api"
import { ContentVideoCard } from "@/components/content-video-card"

interface ContentReviewsSectionProps {
  videos: ContentVideo[]
}

export function ContentReviewsSection({ videos }: ContentReviewsSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" })
    }
  }

  if (videos.length === 0) {
    return null
  }

  return (
    <section id="content" className="py-12 lg:py-20 bg-black scroll-mt-20 lg:scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-start gap-6 mb-10">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-primary shadow-xl shrink-0">
            <Image
              src="/SHARIF.jpeg"
              alt="Sharif - TG World"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-background mb-4">
              Expert Car Reviews & Insights
            </h2>
            <div className="mb-4 animate-fade-in-up">
              <span className="inline-block text-2xl sm:text-3xl font-bold text-primary bg-primary/10 px-4 py-2 rounded-lg border-l-4 border-primary">
                Hi, I am Sharif 👋
              </span>
            </div>
            <p className="text-background/80 text-sm sm:text-base max-w-3xl leading-relaxed">
              Welcome to TG World&apos;s exclusive car review collection! Watch authentic, detailed reviews of every vehicle in our inventory. From powerful engines to luxurious interiors, I personally showcase each car&apos;s features, performance, and unique qualities to help you make the best decision. Real cars, real reviews, real value.
            </p>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-background mb-6">CONTENT REVIEWS 🔥</h3>

        <div className="relative">
          {videos.length > 3 && (
            <>
              <button
                type="button"
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors -ml-5"
              >
                <ChevronLeft className="w-6 h-6 text-foreground" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors -mr-5"
              >
                <ChevronRight className="w-6 h-6 text-foreground" />
              </button>
            </>
          )}

          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-thin pb-4"
            style={{ scrollbarColor: "rgba(255,255,255,0.3) transparent" }}
          >
            {videos.map((video) => (
              <ContentVideoCard key={video.id} video={video} layout="carousel" />
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button
            asChild
            className="bg-background text-foreground hover:bg-background/90 rounded-full px-8 h-12 font-medium"
          >
            <Link href="/content">Show more content</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
