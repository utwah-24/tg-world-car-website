/**
 * Canonical vehicle-type buckets for `cars.type` from the API.
 * Production API may send mixed case (see normalizeCarType).
 * Last audited types from GET /api/cars: SUV, Crossover SUV, Pickup, Sedan, Van, truck (+ case variants).
 *
 * "Crossover SUV" is its own shop/wizard filter, separate from "SUV".
 */
export function normalizeCarType(raw: string): string {
  const x = raw.toLowerCase().trim().replace(/\s+/g, " ")
  if (!x) return ""
  if (x === "trucks") return "truck"
  if (x === "crossover suv") return "crossover_suv"
  return x
}

/** Stable shop / wizard filter order */
export const CAR_TYPE_FILTER_ORDER = [
  "suv",
  "crossover_suv",
  "pickup",
  "sedan",
  "van",
  "truck",
] as const

/** Short label for a canonical type key (matches shop sidebar buttons) */
export function labelForCanonicalCarType(canonical: string): string {
  const c = canonical.toLowerCase()
  const map: Record<string, string> = {
    suv: "SUV",
    crossover_suv: "Crossover SUV",
    pickup: "Pickup",
    sedan: "Sedan",
    van: "Van",
    truck: "Trucks",
  }
  if (map[c]) return map[c]
  /* New API types: hatchback → Hatchback, mini_van → Mini Van */
  return canonical
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

/**
 * Paths to try for `/public/icons/<file>.png`.
 * Includes URI-encoded URLs so spaced / mixed-case filenames (e.g. `Crossover Suv.png`) resolve on strict servers.
 */
export function candidateCarTypeIconPaths(canon: string, label: string): string[] {
  const spaced = canon.replace(/_/g, " ")
  const titleSpaced = spaced.replace(/\b\w/g, (ch) => ch.toUpperCase())
  const fileNames = [
    `${canon}.png`,
    `${spaced}.png`,
    `${titleSpaced}.png`,
    `${label.toLowerCase()}.png`,
  ]
  const seen = new Set<string>()
  const out: string[] = []
  for (const file of [...new Set(fileNames)]) {
    const raw = `/icons/${file}`
    if (!seen.has(raw)) {
      seen.add(raw)
      out.push(raw)
    }
    const encoded = `/icons/${encodeURIComponent(file)}`
    if (!seen.has(encoded)) {
      seen.add(encoded)
      out.push(encoded)
    }
  }
  return out
}

/** Canonical types present in inventory, ordered (known order first, then A–Z). */
export function orderedCanonicalTypesInInventory(
  cars: { type?: string | null }[],
): string[] {
  const norms = new Set<string>()
  cars.forEach((car) => {
    const n = normalizeCarType(car.type || "")
    if (n) norms.add(n)
  })
  const orderSet = new Set<string>(CAR_TYPE_FILTER_ORDER)
  const ordered = CAR_TYPE_FILTER_ORDER.filter((k) => norms.has(k))
  const extra = [...norms].filter((k) => !orderSet.has(k)).sort((a, b) => a.localeCompare(b))
  return [...ordered, ...extra]
}

/** Shop / mobile sheet filter rows — always derived from live `cars` so new API types appear automatically. */
export function buildShopTypeFilterRows(
  cars: { type?: string | null }[],
): { id: string; label: string; apiType: string }[] {
  return orderedCanonicalTypesInInventory(cars).map((canon) => ({
    id: canon,
    apiType: canon,
    label: labelForCanonicalCarType(canon),
  }))
}
