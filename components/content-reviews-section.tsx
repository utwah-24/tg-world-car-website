"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX, Maximize, ChevronLeft, ChevronRight } from "lucide-react"
import type { ContentVideo } from "@/lib/api"

interface ContentReviewsSectionProps {
  videos: ContentVideo[]
}

export function ContentReviewsSection({ videos }: ContentReviewsSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' })
    }
  }

  if (videos.length === 0) {
    return null
  }

  return (
    <section className="py-12 lg:py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-start gap-6 mb-10">
          {/* Sharif's Photo */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-primary shadow-xl shrink-0">
            <Image
              src="/SHARIF.jpeg"
              alt="Sharif - TG World"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Text */}
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
              Welcome to TG World's exclusive car review collection! Watch authentic, detailed reviews of every vehicle in our inventory. From powerful engines to luxurious interiors, I personally showcase each car's features, performance, and unique qualities to help you make the best decision. Real cars, real reviews, real value.
            </p>
          </div>
        </div>

        {/* Most Popular Reviews Title */}
        <h3 className="text-xl font-semibold text-background mb-6">CONTENT REVIEWS 🔥</h3>

        {/* Video Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          {videos.length > 3 && (
            <>
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors -ml-5"
              >
                <ChevronLeft className="w-6 h-6 text-foreground" />
              </button>
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors -mr-5"
              >
                <ChevronRight className="w-6 h-6 text-foreground" />
              </button>
            </>
          )}

          {/* Videos Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-thin pb-4"
            style={{ scrollbarColor: 'rgba(255,255,255,0.3) transparent' }}
          >
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>

        {/* Read More Button */}
        <div className="mt-8 text-center">
          <Button className="bg-background text-foreground hover:bg-background/90 rounded-full px-8 h-12 font-medium">
            Read more reviews
          </Button>
        </div>
      </div>
    </section>
  )
}

function VideoCard({ video }: { video: ContentVideo }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showControls, setShowControls] = useState(false)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    }
  }

  return (
    <div
      className="relative shrink-0 w-[280px] sm:w-[320px] rounded-2xl overflow-hidden bg-background/10 group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Player - Vertical aspect ratio for mobile/TikTok style */}
      <div className="relative" style={{ aspectRatio: "9/16" }}>
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="w-full h-full object-cover"
          loop
          muted={isMuted}
          playsInline
          onEnded={() => setIsPlaying(false)}
        />

        {/* Play/Pause Overlay */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all"
        >
          {!isPlaying && (
            <div className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          )}
        </button>

        {/* Video Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
            showControls || !isPlaying ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            {/* Title */}
            <h4 className="text-white text-sm font-medium line-clamp-2 flex-1">
              {video.title}
            </h4>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white ml-0.5" />
              )}
            </button>

            <button
              onClick={toggleMute}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>

            <div className="flex-1" />

            <button
              onClick={toggleFullscreen}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Maximize className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
