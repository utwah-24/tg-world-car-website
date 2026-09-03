"use client"

import Image from "next/image"
import Link from "next/link"
import type { Promotion } from "@/lib/promotions"
import { cn } from "@/lib/utils"

const STATIC_SLOTS: { src: string; href?: string; label?: string; id: string; width: number; height: number }[] = [
  { src: "/cards%20images/in_dar_img.jpeg", href: "/shop?in_dar=1", label: "View vehicles in Dar es Salaam", id: "in-dar", width: 2656, height: 1624 },
  { src: "/cards%20images/top_selling_img.jpeg", id: "top-selling", width: 2644, height: 1714 },
]

interface HomeSlotsSectionProps {
  showComingSoon?: boolean
  promotions?: Promotion[]
}

export function HomeSlotsSection({ showComingSoon = true, promotions = [] }: HomeSlotsSectionProps) {
  const activePromotions = promotions.filter((p) => p.is_active)
  const firstPromo = activePromotions[0]

  const slots = [
    ...(firstPromo
      ? [{
          id: "special-offer",
          src: firstPromo.promo_pic_urls[0] || "/cards%20images/specail_offer_img.png",
          href: `/shop?promo=${firstPromo.promoID}`,
          label: `View ${firstPromo.promo_name}`,
          externalImage: !!firstPromo.promo_pic_urls[0],
          width: 2980,
          height: 1172,
        }]
      : []),
    ...(showComingSoon
      ? [{ src: "/cards%20images/coming_soon_img.png", href: "/coming-soon", label: "View coming soon vehicles", id: "coming-soon", externalImage: false, width: 2944, height: 1414 }]
      : []),
    ...STATIC_SLOTS.map((slot) => ({ ...slot, externalImage: false })),
  ]

  if (slots.length === 0) return null

  return (
    <section
      id="home-slots"
      className="py-5 sm:py-6 scroll-mt-20 lg:scroll-mt-24 border-b border-border bg-background"
      aria-label="Featured content"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "grid items-start justify-items-center gap-3 sm:gap-4",
            slots.length === 1 && "grid-cols-1 max-w-sm mx-auto",
            slots.length === 2 && "grid-cols-2",
            slots.length === 3 && "grid-cols-2 sm:grid-cols-3",
            slots.length >= 4 && "grid-cols-2 sm:grid-cols-4",
          )}
        >
          {slots.map(({ src, href, label, id, externalImage, width, height }) => {
            const card = (
              <div
                className={cn(
                  "rounded-2xl border border-border bg-background overflow-hidden",
                  "transition-all duration-300 ease-out",
                  "hover:-translate-y-0.5 hover:border-border",
                  "hover:shadow-[8px_0_20px_-6px_rgba(0,0,0,0.12),-8px_0_20px_-6px_rgba(0,0,0,0.12),0_8px_24px_-8px_rgba(0,0,0,0.1)]",
                  "dark:hover:shadow-[8px_0_24px_-6px_rgba(0,0,0,0.45),-8px_0_24px_-6px_rgba(0,0,0,0.45),0_10px_28px_-8px_rgba(0,0,0,0.35)]",
                  href && "cursor-pointer",
                )}
              >
                {externalImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt={label ?? ""}
                    className="block h-auto w-full"
                  />
                ) : (
                  <Image
                    src={src}
                    alt={label ?? ""}
                    width={width}
                    height={height}
                    className="block h-auto w-full"
                    sizes="(max-width: 640px) 50vw, 25vw"
                    unoptimized
                  />
                )}
              </div>
            )

            return href ? (
              <Link key={id ?? src} href={href} aria-label={label} className="w-full max-w-sm">
                {card}
              </Link>
            ) : (
              <div key={id ?? src} aria-hidden className="w-full max-w-sm">
                {card}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
