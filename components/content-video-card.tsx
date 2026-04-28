"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX, Maximize, X } from "lucide-react"
import type { ContentVideo } from "@/lib/api"
import { cn } from "@/lib/utils"

interface ContentVideoCardProps {
  video: ContentVideo
  /** Carousel strips fixed widths; grid fills the cell */
  layout?: "carousel" | "grid"
}

export function ContentVideoCard({ video, layout = "carousel" }: ContentVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showControls, setShowControls] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

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

  const closeExpanded = () => setIsExpanded(false)

  return (
    <>
      <div
        className={cn(
          "relative rounded-2xl overflow-hidden bg-white/10 group",
          layout === "carousel" && "shrink-0 w-[280px] sm:w-[320px]",
          layout === "grid" && "w-full"
        )}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
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

          <button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all"
          >
            {!isPlaying && (
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 sm:w-7 sm:h-7 text-white ml-0.5 sm:ml-1" />
              </div>
            )}
          </button>

          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
              showControls || !isPlaying ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white text-sm font-medium line-clamp-2 flex-1">{video.title}</h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
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
                type="button"
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
                type="button"
                onClick={() => setIsExpanded(true)}
                className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <Maximize className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-lg animate-fade-in p-4 sm:p-8"
          onClick={closeExpanded}
        >
          <button
            type="button"
            onClick={closeExpanded}
            className="absolute top-4 right-4 z-[10000] w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div
            className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8 max-w-7xl w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex-shrink-0" style={{ height: "80vh", aspectRatio: "9/16" }}>
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                <video
                  src={video.videoUrl}
                  className="w-full h-full object-cover"
                  loop
                  muted={isMuted}
                  playsInline
                  autoPlay
                  controls
                  controlsList="nodownload"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center gap-8 max-w-md lg:max-w-lg">
              <h3 className="text-white text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
                {video.title}
              </h3>

              <a href={video.carId ? `/car/${video.carId}` : "/shop"}>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-10 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 w-fit">
                  Show
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
