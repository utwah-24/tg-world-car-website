"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

const HOME_SLOTS: { src: string; href?: string; label?: string; id?: string }[] = [
  { src: "/cards%20images/specail_offer_img.png", id: "special-offer" },
  { src: "/cards%20images/coming_soon_img.png", href: "/coming-soon", label: "View coming soon vehicles", id: "coming-soon" },
  { src: "/cards%20images/in_dar_img.jpeg", href: "/shop?in_dar=1", label: "View vehicles in Dar es Salaam", id: "in-dar" },
  { src: "/cards%20images/top_selling_img.jpeg", id: "top-selling" },
]

interface HomeSlotsSectionProps {
  showComingSoon?: boolean
}

export function HomeSlotsSection({ showComingSoon = true }: HomeSlotsSectionProps) {
  const slots = showComingSoon
    ? HOME_SLOTS
    : HOME_SLOTS.filter((slot) => slot.id !== "coming-soon")

  return (
    <section
      id="home-slots"
      className="py-5 sm:py-6 scroll-mt-20 lg:scroll-mt-24 border-b border-border bg-background"
      aria-label="Featured content"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {slots.map(({ src, href, label, id }) => {
            const card = (
              <div
                className={cn(
                  "relative min-h-[120px] sm:min-h-[140px] rounded-2xl border border-border bg-background",
                  "transition-all duration-300 ease-out",
                  "hover:-translate-y-0.5 hover:border-border",
                  "hover:shadow-[8px_0_20px_-6px_rgba(0,0,0,0.12),-8px_0_20px_-6px_rgba(0,0,0,0.12),0_8px_24px_-8px_rgba(0,0,0,0.1)]",
                  "dark:hover:shadow-[8px_0_24px_-6px_rgba(0,0,0,0.45),-8px_0_24px_-6px_rgba(0,0,0,0.45),0_10px_28px_-8px_rgba(0,0,0,0.35)]",
                  href && "cursor-pointer",
                )}
              >
                <Image
                  src={src}
                  alt={label ?? ""}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 50vw, 25vw"
                  unoptimized
                />
              </div>
            )

            return href ? (
              <Link key={id ?? src} href={href} aria-label={label}>
                {card}
              </Link>
            ) : (
              <div key={id ?? src} aria-hidden>
                {card}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
