"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { Clock, CalendarDays, X, Tag, ChevronLeft, ChevronRight } from "lucide-react"
import type { Car } from "@/lib/cars-data"
import { cn } from "@/lib/utils"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

interface ComingSoonSectionProps {
  cars: Car[]
}

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
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

// ── Card ──────────────────────────────────────────────────────────────────────

function ComingSoonCard({
  car,
  index,
  onSelect,
}: {
  car: Car
  index: number
  onSelect: (car: Car) => void
}) {
  const yearPrefix = car.year ? `${car.year} ` : ""
  const palette = PALETTES[index % PALETTES.length]

  return (
    <button
      type="button"
      onClick={() => onSelect(car)}
      className={cn(
        "group flex min-w-[300px] sm:min-w-[360px] h-[150px] sm:h-[165px]",
        "rounded-2xl overflow-hidden border border-border/60",
        "shadow-sm hover:shadow-xl transition-all duration-300",
        "select-none flex-shrink-0 bg-white text-left cursor-pointer",
      )}
      aria-label={`Preview ${yearPrefix}${car.name}`}
    >
      {/* Left: image */}
      <div className="relative w-[54%] shrink-0 overflow-hidden">
        <Image
          src={car.image || "/placeholder.svg"}
          alt={`${yearPrefix}${car.name}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 162px, 194px"
          unoptimized={car.image?.startsWith("http")}
        />
        <div
          className={cn(
            "absolute inset-y-0 right-0 w-14 bg-gradient-to-r from-transparent",
            palette.fade,
          )}
        />
      </div>

      {/* Right: info */}
      <div className={cn("flex-1 flex flex-col justify-center px-4 py-4 min-w-0", palette.panel)}>
        <div className="flex items-center gap-1 mb-2">
          <Clock className="w-3 h-3 text-primary shrink-0" aria-hidden />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary leading-none">
            Coming Soon
          </span>
        </div>
        <p
          className="text-lg sm:text-xl font-extrabold text-foreground leading-tight mb-1.5 truncate"
          title={car.price}
        >
          {car.price && car.price !== "—" ? car.price : "Price TBA"}
        </p>
        <p className="text-[11px] sm:text-xs font-medium text-foreground/75 line-clamp-2 leading-snug mb-1.5">
          {yearPrefix}{car.name}
        </p>
        {car.arrivalDate && (
          <div className="flex items-center gap-1 mt-auto">
            <CalendarDays className="w-3 h-3 text-muted-foreground shrink-0" aria-hidden />
            <span className="text-[10px] text-muted-foreground leading-none">
              {formatArrivalDate(car.arrivalDate)}
            </span>
          </div>
        )}
      </div>
    </button>
  )
}

// ── Detail modal ──────────────────────────────────────────────────────────────

function CarModal({ car, onClose }: { car: Car; onClose: () => void }) {
  const yearPrefix = car.year ? `${car.year} ` : ""
  const images = (car.images && car.images.length > 0) ? car.images : [car.image || "/placeholder.svg"]
  const [imgIdx, setImgIdx] = useState(0)

  const prev = useCallback(() => setImgIdx((i) => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setImgIdx((i) => (i + 1) % images.length), [images.length])

  // Keyboard: Escape closes, ←/→ navigates
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose, prev, next])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className={cn(
          "relative w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl",
          "animate-in fade-in zoom-in-95 duration-300 ease-out",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors text-white"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── Image slider ── */}
        <div className="relative w-full h-64 sm:h-80 bg-gray-100 overflow-hidden">
          <Image
            key={imgIdx}
            src={images[imgIdx]}
            alt={`${yearPrefix}${car.name} — image ${imgIdx + 1}`}
            fill
            className="object-cover animate-in fade-in duration-300"
            sizes="(max-width: 640px) 100vw, 576px"
            unoptimized={images[imgIdx]?.startsWith("http")}
          />

          {/* Bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

          {/* COMING SOON badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#CC4D00] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
            <Clock className="w-3 h-3" aria-hidden />
            Coming Soon
          </div>

          {/* Prev / Next arrows — only show when more than 1 image */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-black/30 hover:bg-black/55 flex items-center justify-center text-white transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-black/30 hover:bg-black/55 flex items-center justify-center text-white transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" aria-hidden />
              </button>
            </>
          )}

          {/* Counter */}
          {images.length > 1 && (
            <span className="absolute bottom-3 right-3 z-10 text-[11px] font-semibold text-white bg-black/40 px-2 py-0.5 rounded-full">
              {imgIdx + 1} / {images.length}
            </span>
          )}

          {/* Dot indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImgIdx(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-200",
                    i === imgIdx ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80",
                  )}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div className="px-5 pb-6 pt-4">
          <h3 className="text-lg font-bold text-foreground leading-snug mb-1">
            {yearPrefix}{car.name}
          </h3>

          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-[#CC4D00] shrink-0" aria-hidden />
            <span className="text-xl font-extrabold text-[#CC4D00]">
              {car.price && car.price !== "—" ? car.price : "Price TBA"}
            </span>
          </div>

          {car.arrivalDate && (
            <div className="flex items-center gap-2 bg-orange-50 rounded-xl px-3 py-2.5">
              <CalendarDays className="w-4 h-4 text-[#CC4D00] shrink-0" aria-hidden />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#CC4D00]">Arriving</p>
                <p className="text-sm font-semibold text-foreground">{formatArrivalDate(car.arrivalDate)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────

// How many times to repeat the card set — keeps the duplicate well off-screen
// even on very wide displays or when only a few cards qualify.
const REPEATS = 4

export function ComingSoonSection({ cars }: ComingSoonSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const isPaused = useRef(false)
  const dragStartX = useRef<number | null>(null)
  const dragStartOffset = useRef(0)
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 })

  // Only show cars that have an arrival_date set
  const qualified = cars.filter((c) => c.arrivalDate)

  if (qualified.length === 0) return null

  const row1 = qualified.filter((_, i) => i % 2 === 0)
  const row2 = qualified.filter((_, i) => i % 2 === 1)
  // Repeat REPEATS times — ensures one set width >> viewport so duplicate is invisible
  const row1Loop = Array.from({ length: REPEATS }, () => row1).flat()
  const row2Loop = Array.from({ length: REPEATS }, () => row2).flat()

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleSelect = useCallback((car: Car) => {
    isPaused.current = true
    setSelectedCar(car)
  }, [])

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleClose = useCallback(() => {
    setSelectedCar(null)
    isPaused.current = false
  }, [])

  // Auto-scroll loop
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let rafId: number
    const SPEED = 0.5

    const step = () => {
      if (!isPaused.current) {
        const oneSet = track.scrollWidth / REPEATS
        if (oneSet > 0) {
          offsetRef.current += SPEED
          if (offsetRef.current >= oneSet) offsetRef.current -= oneSet
          track.style.transform = `translateX(-${offsetRef.current}px)`
        }
      }
      rafId = requestAnimationFrame(step)
    }

    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [])

  // ── Drag-to-scroll (mouse) ──────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isPaused.current = true
    dragStartX.current = e.clientX
    dragStartOffset.current = offsetRef.current
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragStartX.current === null) return
    const track = trackRef.current
    if (!track) return
    const oneSet = track.scrollWidth / REPEATS
    const delta = dragStartX.current - e.clientX
    offsetRef.current = ((dragStartOffset.current + delta) % oneSet + oneSet) % oneSet
    track.style.transform = `translateX(-${offsetRef.current}px)`
  }, [])

  const onMouseUp = useCallback(() => {
    dragStartX.current = null
    setTimeout(() => { if (!selectedCar) isPaused.current = false }, 800)
  }, [selectedCar])

  // ── Drag-to-scroll (touch) ──────────────────────────────────────────────────
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    isPaused.current = true
    dragStartX.current = e.touches[0].clientX
    dragStartOffset.current = offsetRef.current
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStartX.current === null) return
    const track = trackRef.current
    if (!track) return
    const oneSet = track.scrollWidth / REPEATS
    const delta = dragStartX.current - e.touches[0].clientX
    offsetRef.current = ((dragStartOffset.current + delta) % oneSet + oneSet) % oneSet
    track.style.transform = `translateX(-${offsetRef.current}px)`
  }, [])

  const onTouchEnd = useCallback(() => {
    dragStartX.current = null
    setTimeout(() => { if (!selectedCar) isPaused.current = false }, 800)
  }, [selectedCar])

  const pauseScroll = () => { isPaused.current = true }
  const resumeScroll = () => { if (!selectedCar) isPaused.current = false }


  return (
    <>
      <section
        id="coming-soon"
        className="py-10 sm:py-14 scroll-mt-20 lg:scroll-mt-24 overflow-hidden w-full"
        style={{ backgroundColor: "#CC4D00" }}
        aria-label="Coming Soon cars"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
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

          </div>

          {/* Scroll strip — overflow:hidden clips duplicate copies off-screen */}
          <div
            className="relative -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseEnter={pauseScroll}
            onMouseLeave={(e) => { onMouseUp(); resumeScroll() }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
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

            {/* Moving track */}
            <div
              ref={trackRef}
              className="flex flex-col gap-3 sm:gap-4 pb-3 px-4 sm:px-6 lg:px-8 will-change-transform"
            >
              {/* Row 1 */}
              <div className="flex gap-3 sm:gap-4">
                {row1Loop.map((car, i) => (
                  <ComingSoonCard
                    key={`r1-${car.id}-${i}`}
                    car={car}
                    index={(i % row1.length) * 2}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
              {/* Row 2 — desktop only, bento stagger */}
              {row2.length > 0 && (
                <div
                  className="hidden sm:flex gap-3 sm:gap-4"
                  style={{ paddingLeft: "calc((300px + 0.75rem) / 2)" }}
                >
                  {row2Loop.map((car, i) => (
                    <ComingSoonCard
                      key={`r2-${car.id}-${i}`}
                      car={car}
                      index={(i % row2.length) * 2 + 1}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Floating detail modal */}
      {selectedCar && <CarModal car={selectedCar} onClose={handleClose} />}
    </>
  )
}
