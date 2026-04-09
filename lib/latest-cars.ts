import type { Car } from "@/lib/cars-data"

/** How long a listing stays in “Latest cars” after upload */
export const LATEST_WINDOW_MS = 30 * 24 * 60 * 60 * 1000

export function isCarInLatestWindow(createdAt?: string): boolean {
  if (!createdAt) return false
  const t = Date.parse(createdAt)
  if (Number.isNaN(t)) return false
  const age = Date.now() - t
  if (age < 0) return false
  return age <= LATEST_WINDOW_MS
}

export function filterLatestCars(cars: Car[]): Car[] {
  const seen = new Set<string>()
  return cars
    .filter((car) => {
      if (!isCarInLatestWindow(car.createdAt)) return false
      if (seen.has(car.id)) return false
      seen.add(car.id)
      return true
    })
    .sort((a, b) => {
      const ta = a.createdAt ? Date.parse(a.createdAt) : 0
      const tb = b.createdAt ? Date.parse(b.createdAt) : 0
      return tb - ta
    })
}
