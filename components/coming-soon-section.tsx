"use client"

import { useRef, useEffect } from "react"
import Image from "next/image"
import { ArrowRight, Clock, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Car } from "@/lib/cars-data"
import { cn } from "@/lib/utils"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

interface ComingSoonSectionProps {
  cars: Car[]
}

/** Palette for the right-side info panel — soft pastels matching the image edge fade */
const PALETTES = [
  { panel: "bg-amber-50",   fade: "to-amber-50"   },
  { panel: "bg-sky-50",     fade: "to-sky-50"      },
  { panel: "bg-emerald-50", fade: "to-emerald-50"  },
  { panel: "bg-rose-50",    fade: "to-rose-50"     },
  { panel: "bg-violet-50",  fade: "to-violet-50"   },
  { panel: "bg-cyan-50",    fade: "to-cyan-50"     },
]

function formatArrivalDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

function ComingSoonCard({ car, index }: { car: Car; index: number }) {
  const yearPrefix = car.year ? `${car.year} ` : ""
  const palette = PALETTES[index % PALETTES.length]

  return (
    <a
      href={`/car/${car.id}`}
      className={cn(
        "group flex min-w-[300px] sm:min-w-[360px] h-[150px] sm:h-[165px]",
        "rounded-2xl overflow-hidden border border-border/60",
        "shadow-sm hover:shadow-xl transition-all duration-300",
        "select-none flex-shrink-0 bg-white",
      )}
      aria-label={`View ${yearPrefix}${car.name}`}
    >
      {/* ── Left column: car image ── */}
      <div className="relative w-[54%] shrink-0 overflow-hidden">
        <Image
          src={car.image || "/placeholder.svg"}
          alt={`${yearPrefix}${car.name}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 162px, 194px"
          unoptimized={car.image?.startsWith("http")}
        />
        {/* Fade the right edge of the image into the panel colour */}
        <div
          className={cn(
            "absolute inset-y-0 right-0 w-14 bg-gradient-to-r from-transparent",
            palette.fade,
          )}
        />
      </div>

      {/* ── Right column: info panel ── */}
      <div
        className={cn(
          "flex-1 flex flex-col justify-center px-4 py-4 min-w-0",
          palette.panel,
        )}
      >
        {/* "COMING SOON" label */}
        <div className="flex items-center gap-1 mb-2">
          <Clock className="w-3 h-3 text-primary shrink-0" aria-hidden />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary leading-none">
            Coming Soon
          </span>
        </div>

        {/* Price */}
        <p
          className="text-lg sm:text-xl font-extrabold text-foreground leading-tight mb-1.5 truncate"
          title={car.price}
        >
          {car.price && car.price !== "—" ? car.price : "Price TBA"}
        </p>

        {/* Car name */}
        <p className="text-[11px] sm:text-xs font-medium text-foreground/75 line-clamp-2 leading-snug mb-1.5">
          {yearPrefix}{car.name}
        </p>

        {/* Arrival date */}
        {car.arrivalDate && (
          <div className="flex items-center gap-1 mt-auto">
            <CalendarDays className="w-3 h-3 text-muted-foreground shrink-0" aria-hidden />
            <span className="text-[10px] text-muted-foreground leading-none">
              {formatArrivalDate(car.arrivalDate)}
            </span>
          </div>
        )}
      </div>
    </a>
  )
}

export function ComingSoonSection({ cars }: ComingSoonSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isPaused = useRef(false)
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 })

  if (cars.length === 0) return null

  // Prefer cars that have an arrival_date first, then the rest
  const qualified = [
    ...cars.filter((c) => c.arrivalDate),
    ...cars.filter((c) => !c.arrivalDate),
  ]

  // Split into two interleaved rows so the bento offset works naturally
  const row1 = qualified.filter((_, i) => i % 2 === 0)
  const row2 = qualified.filter((_, i) => i % 2 === 1)

  // Duplicate rows for seamless infinite loop
  const row1Loop = [...row1, ...row1]
  const row2Loop = [...row2, ...row2]

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let rafId: number
    const SPEED = 0.5 // px per frame
    const step = () => {
      if (!isPaused.current) {
        el.scrollLeft += SPEED
        // The first row is duplicated — its single-copy width is half the first
        // child's scrollWidth. Snap back when we cross that midpoint so the loop
        // is seamless regardless of how many rows are visible.
        const firstRow = el.querySelector<HTMLElement>("div.flex")
        const loopWidth = firstRow ? firstRow.scrollWidth / 2 : el.scrollWidth / 2
        if (el.scrollLeft >= loopWidth) {
          el.scrollLeft -= loopWidth
        }
      }
      rafId = requestAnimationFrame(step)
    }
    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [])

  const pauseScroll = () => { isPaused.current = true }
  const resumeScroll = () => { isPaused.current = false }

  const manualScroll = (dir: "left" | "right") => {
    isPaused.current = true
    scrollRef.current?.scrollBy({ left: dir === "right" ? 380 : -380, behavior: "smooth" })
    // resume auto-scroll after manual nudge settles
    setTimeout(() => { isPaused.current = false }, 1200)
  }

  return (
    <section
      id="coming-soon"
      className="py-10 sm:py-14 scroll-mt-20 lg:scroll-mt-24 overflow-hidden w-full"
      style={{ backgroundColor: "#CC4D00" }}
      aria-label="Coming Soon cars"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header row */}
        <div
          ref={headerRef}
          className={cn(
            "flex items-end justify-between mb-6 sm:mb-8 transition-all duration-700 ease-out",
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Coming soon
            </h2>
            <p className="mt-1 text-sm text-white/70">
              {qualified.length} {qualified.length === 1 ? "vehicle" : "vehicles"} arriving soon
            </p>
          </div>

          {/* Desktop scroll arrows */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => manualScroll("left")}
              className="h-9 w-9 rounded-full border border-white/30 bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
              aria-label="Scroll left"
            >
              <ArrowRight className="w-4 h-4 rotate-180" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => manualScroll("right")}
              className="h-9 w-9 rounded-full border border-white/30 bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
              aria-label="Scroll right"
            >
              <ArrowRight className="w-4 h-4" aria-hidden />
            </button>
          </div>
        </div>

        {/* Bento-style 2-row auto-scroll: hover pauses, manual scroll supported */}
        <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
          {/* Left fade */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-24"
            style={{ background: "linear-gradient(to right, #CC4D00, transparent)" }}
          />
          {/* Right fade */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-24"
            style={{ background: "linear-gradient(to left, #CC4D00, transparent)" }}
          />
        <div
          ref={scrollRef}
          className="overflow-x-auto pb-3 px-4 sm:px-6 lg:px-8"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onMouseEnter={pauseScroll}
          onMouseLeave={resumeScroll}
          onTouchStart={pauseScroll}
          onTouchEnd={resumeScroll}
        >
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Row 1 — starts at the left edge */}
            <div className="flex gap-3 sm:gap-4">
              {row1Loop.map((car, i) => (
                <ComingSoonCard key={`r1-${car.id}-${i}`} car={car} index={(i % row1.length) * 2} />
              ))}
            </div>
            {/* Row 2 — desktop only, shifted right for the bento stagger */}
            {row2.length > 0 && (
              <div
                className="hidden sm:flex gap-3 sm:gap-4"
                style={{ paddingLeft: "calc((300px + 0.75rem) / 2)" }}
              >
                {row2Loop.map((car, i) => (
                  <ComingSoonCard key={`r2-${car.id}-${i}`} car={car} index={(i % row2.length) * 2 + 1} />
                ))}
              </div>
            )}
          </div>
        </div>
        </div>{/* end fade wrapper */}

        {/* See all CTA */}
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            asChild
            className="rounded-full px-8 h-11 border-white/50 text-white hover:bg-white hover:text-[#CC4D00] bg-transparent"
          >
            <a href="/shop">See all coming soon</a>
          </Button>
        </div>
      </div>
    </section>
  )
}
