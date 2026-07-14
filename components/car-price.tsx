import type { Car } from "@/lib/cars-data"
import { getActivePromotions, getDisplayPrice, isCarOnPromo } from "@/lib/promotions"
import { cn } from "@/lib/utils"

interface CarPriceProps {
  car: Car
  compact?: boolean
  className?: string
  /** Larger display for detail / checkout pages */
  size?: "card" | "detail"
}

export function CarPrice({ car, compact, className, size = "card" }: CarPriceProps) {
  const { current, original } = getDisplayPrice(car)
  const activePromo = getActivePromotions(car)[0]
  const onPromo = isCarOnPromo(car)

  if (size === "detail") {
    return (
      <div className={cn("space-y-1", className)}>
        {original && (
          <p className="text-lg text-muted-foreground line-through">{original}</p>
        )}
        <div className={cn("font-bold", onPromo ? "text-red-600" : "text-foreground", "text-3xl")}>
          {current}
        </div>
        {activePromo && (
          <p className="text-sm font-semibold text-red-600">
            {activePromo.price_reduction_label} OFF
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {original && (
        <span
          className={cn(
            "text-muted-foreground line-through",
            compact ? "text-[10px] sm:text-xs" : "text-xs sm:text-sm",
          )}
        >
          {original}
        </span>
      )}
      <span
        className={cn(
          "font-bold leading-tight",
          onPromo ? "text-red-600" : "text-foreground",
          compact ? "text-xs sm:text-sm" : "text-base sm:text-xl",
        )}
      >
        {current}
      </span>
      {activePromo && (
        <span
          className={cn(
            "font-semibold text-red-600",
            compact ? "text-[9px] sm:text-[10px]" : "text-[10px] sm:text-xs",
          )}
        >
          {activePromo.price_reduction_label} OFF
        </span>
      )}
    </div>
  )
}
