"use client"

import Link from "next/link"
import type { Promotion } from "@/lib/promotions"
import { formatPromoDateRange } from "@/lib/promotions"
import { cn } from "@/lib/utils"

interface PromotionsSectionProps {
  promotions: Promotion[]
}

export function PromotionsSection({ promotions }: PromotionsSectionProps) {
  if (promotions.length === 0) return null

  return (
    <section
      id="promotions"
      className="py-5 sm:py-6 scroll-mt-20 lg:scroll-mt-24 border-b border-border bg-background"
      aria-label="Special offers"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 sm:mb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Special Offers</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Limited-time deals on selected vehicles
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promo) => {
            const imageUrl = promo.promo_pic_urls[0]
            const href = `/shop?promo=${promo.promoID}`

            return (
              <Link
                key={promo.promoID}
                href={href}
                className={cn(
                  "group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300",
                  "hover:-translate-y-0.5 hover:shadow-lg",
                )}
                aria-label={`View ${promo.promo_name} promotion`}
              >
                {imageUrl ? (
                  <div className="relative aspect-[16/9] bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={promo.promo_name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative aspect-[16/9] bg-gradient-to-br from-red-600 to-[#0A1628] flex items-center justify-center p-6">
                    <span className="text-white text-lg font-bold text-center">{promo.promo_name}</span>
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {promo.promo_name}
                    </h3>
                    <span className="shrink-0 rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
                      {promo.price_reduction_label} OFF
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatPromoDateRange(promo.start_date, promo.end_date)}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
