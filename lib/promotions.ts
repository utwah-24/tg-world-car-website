import type { Car } from "./cars-data"

export interface Promotion {
  promoID: number
  promo_name: string
  price_reduction: number
  price_reduction_label: string
  promo_pics: string[] | null
  promo_pic_urls: string[]
  start_date: string
  end_date: string
  status: "active" | "inactive"
  is_active: boolean
  car_ids?: number[]
}

export interface CarPromotion {
  promoID: number
  promo_name: string
  price_reduction: number
  price_reduction_label: string
  start_date: string
  end_date: string
  status: "active" | "inactive"
  is_active: boolean
}

export function isCarOnPromo(car: Car): boolean {
  return car.promoSet === true && car.promoPrice != null
}

export function getDisplayPrice(car: Car): { current: string; original: string | null } {
  if (isCarOnPromo(car)) {
    return { current: car.promoPrice!, original: car.price }
  }
  return { current: car.price, original: null }
}

export function getActivePromotions(car: Car): CarPromotion[] {
  return car.promotions?.filter((p) => p.is_active) ?? []
}

export function getActivePromotionsFromList(promos: Promotion[]): Promotion[] {
  return promos.filter((p) => p.is_active)
}

export function formatPromoDateRange(start: string, end: string): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  return `${fmt(start)} – ${fmt(end)}`
}

export function filterCarsByPromotion(cars: Car[], promotion: Promotion): Car[] {
  if (!promotion.car_ids?.length) {
    return cars.filter(isCarOnPromo)
  }
  const ids = new Set(promotion.car_ids.map(String))
  return cars.filter((car) => ids.has(car.id))
}
