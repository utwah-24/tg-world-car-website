import { isThirdPartyCar, type Car } from "@/lib/cars-data"

export function normalizeType(t: string): string {
  const x = t.toLowerCase().trim()
  if (x === "trucks") return "truck"
  return x
}

/** Model label for wizard + filtering: API model code when present, else full name */
export function carModelLabel(car: Car): string {
  const m = car.model?.trim()
  if (m) return m
  return (car.name || "").trim()
}

/** Extract millions from strings like "37.5 Million Tshs" or "155Million" */
export function parsePriceMillions(priceStr: string): number | null {
  if (!priceStr) return null
  const normalized = priceStr.replace(/,/g, "")
  const million = normalized.match(/([\d.]+)\s*Million/i)
  if (million) return parseFloat(million[1])
  const plain = normalized.match(/^[\d.]+$/)
  if (plain) return parseFloat(normalized)
  const anyNum = normalized.match(/([\d.]+)/)
  return anyNum ? parseFloat(anyNum[1]) : null
}

export interface FindCarCriteria {
  type?: string
  company?: string
  brand?: string
  /** Exact match on car.model when set, else car.name */
  modelName?: string
  condition?: "new" | "second_hand" | "third_party" | ""
  priceMinMillion?: number
  priceMaxMillion?: number
  yearMin?: number
  yearMax?: number
}

export function filterCarsByCriteria(cars: Car[], c: FindCarCriteria): Car[] {
  return cars.filter((car) => {
    if (c.type) {
      if (normalizeType(car.type || "") !== normalizeType(c.type)) return false
    }
    if (c.company) {
      if ((car.company || "").trim().toLowerCase() !== c.company.trim().toLowerCase()) return false
    }
    if (c.brand) {
      if ((car.brand || "").trim().toLowerCase() !== c.brand.trim().toLowerCase()) return false
    }
    if (c.modelName) {
      if (carModelLabel(car) !== c.modelName.trim()) return false
    }
    if (c.condition === "third_party") {
      if (!isThirdPartyCar(car)) return false
    } else if (c.condition) {
      if ((car.condition || "").toLowerCase() !== c.condition.toLowerCase()) return false
    }

    const pm = parsePriceMillions(car.price || "")
    if (c.priceMinMillion != null && Number.isFinite(c.priceMinMillion)) {
      if (pm == null || pm < c.priceMinMillion) return false
    }
    if (c.priceMaxMillion != null && Number.isFinite(c.priceMaxMillion)) {
      if (pm == null || pm > c.priceMaxMillion) return false
    }

    const y = car.year
    if (c.yearMin != null && Number.isFinite(c.yearMin)) {
      if (y == null || y < c.yearMin) return false
    }
    if (c.yearMax != null && Number.isFinite(c.yearMax)) {
      if (y == null || y > c.yearMax) return false
    }

    return true
  })
}

export function uniqueTypes(cars: Car[]): string[] {
  const s = new Set<string>()
  cars.forEach((car) => {
    if (car.type?.trim()) s.add(car.type.trim())
  })
  return Array.from(s).sort((a, b) => a.localeCompare(b))
}

export function uniqueCompanies(cars: Car[], type?: string): string[] {
  const s = new Set<string>()
  const list = type
    ? cars.filter((car) => normalizeType(car.type || "") === normalizeType(type))
    : cars
  list.forEach((car) => {
    if (car.company?.trim()) s.add(car.company.trim())
  })
  return Array.from(s).sort((a, b) => a.localeCompare(b))
}

export function uniqueBrands(cars: Car[], type?: string, company?: string): string[] {
  let list = cars
  if (type) list = list.filter((car) => normalizeType(car.type || "") === normalizeType(type))
  if (company) {
    list = list.filter(
      (car) => (car.company || "").trim().toLowerCase() === company.trim().toLowerCase()
    )
  }
  const s = new Set<string>()
  list.forEach((car) => {
    if (car.brand?.trim()) s.add(car.brand.trim())
  })
  return Array.from(s).sort((a, b) => a.localeCompare(b))
}

export function uniqueModelNames(cars: Car[], type?: string, company?: string, brand?: string): string[] {
  let list = cars
  if (type) list = list.filter((car) => normalizeType(car.type || "") === normalizeType(type))
  if (company) {
    list = list.filter(
      (car) => (car.company || "").trim().toLowerCase() === company.trim().toLowerCase()
    )
  }
  if (brand) {
    list = list.filter((car) => (car.brand || "").trim().toLowerCase() === brand.trim().toLowerCase())
  }
  const s = new Set<string>()
  list.forEach((car) => {
    const label = carModelLabel(car)
    if (label) s.add(label)
  })
  return Array.from(s).sort((a, b) => a.localeCompare(b))
}
