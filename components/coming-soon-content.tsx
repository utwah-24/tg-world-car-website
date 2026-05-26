"use client"

import { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Car } from "@/lib/cars-data"
import { Car as CarIcon, Calendar, Clock, ArrowLeft } from "lucide-react"

interface ComingSoonContentProps {
  cars: Car[]
}

function formatArrivalDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
  } catch {
    return iso
  }
}

function ComingSoonCard({ car }: { car: Car }) {
  const yearPrefix = car.year ? `${car.year} ` : ""
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-xl">
      {/* Image */}
      <div className="relative aspect-[3/2] overflow-hidden bg-muted">
        <Image
          src={car.image || "/placeholder.svg"}
          alt={`${yearPrefix}${car.name}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          unoptimized={car.image?.startsWith("http")}
        />
        {/* Coming Soon overlay badge */}
        <div className="absolute bottom-1.5 left-1.5">
          <span className="rounded-full bg-[#0A1628] px-2 py-0.5 text-[9px] font-medium text-white">
            Coming Soon
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-2 sm:p-2.5 lg:p-3">
        <h3 className="line-clamp-2 text-[11px] sm:text-xs font-semibold leading-snug text-foreground mb-1">
          {yearPrefix}{car.name}
        </h3>
        <span className="text-xs sm:text-sm font-bold text-foreground leading-tight mb-auto">
          {car.price}
        </span>
        {car.arrivalDate ? (
          <div className="flex items-center gap-1 font-medium text-[#0A1628] bg-blue-50 border border-blue-200 rounded-full w-fit text-[9px] sm:text-[10px] px-1.5 py-0.5 mt-2">
            <Calendar className="w-2.5 h-2.5 shrink-0" />
            <span>
              Arrives{" "}
              {new Date(car.arrivalDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 font-medium text-muted-foreground bg-muted border border-border rounded-full w-fit text-[9px] sm:text-[10px] px-1.5 py-0.5 mt-2">
            <Clock className="w-2.5 h-2.5 shrink-0" />
            <span>Arriving soon</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function ComingSoonContent({ cars }: ComingSoonContentProps) {
  const withDate = useMemo(() => cars.filter((c) => c.arrivalDate), [cars])
  const withoutDate = useMemo(() => cars.filter((c) => !c.arrivalDate), [cars])
  const sorted = useMemo(
    () => [
      ...withDate.sort((a, b) =>
        (a.arrivalDate ?? "").localeCompare(b.arrivalDate ?? ""),
      ),
      ...withoutDate,
    ],
    [withDate, withoutDate],
  )

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      {/* Scrollable area: hero + grid */}
      <div
        className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-4 sm:px-6 lg:px-8 pb-10"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* Hero banner */}
        <div className="mb-6 mt-4 animate-fade-in-up">
          <div
            className="relative overflow-hidden rounded-2xl bg-black"
            style={{ height: "210px" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/zenigame-photo-oaZ9WEVW7g8-unsplash.jpg"
              alt="Coming soon vehicles"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent" />
            <div className="relative z-10 flex h-full flex-col justify-center px-8">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-primary text-sm font-semibold uppercase tracking-widest">
                  Arriving Soon
                </span>
              </div>
              <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight mb-1.5">
                Coming Soon
              </h1>
              <p className="text-white/60 text-sm mb-4">
                {cars.length} vehicle{cars.length !== 1 ? "s" : ""} arriving to our fleet
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 self-start rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:border-white/50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-24">
            <CarIcon className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No upcoming vehicles right now
            </h2>
            <p className="text-muted-foreground text-sm">
              Check back soon for new arrivals.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-3">
            {sorted.map((car, index) => (
              <div
                key={car.id}
                className="animate-fade-in-up h-full"
                style={{
                  animationDelay: `${0.1 + index * 0.05}s`,
                  opacity: 0,
                  animationFillMode: "forwards",
                }}
              >
                <ComingSoonCard car={car} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
