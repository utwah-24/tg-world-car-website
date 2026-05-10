/**
 * Parse odometer from API `mileage` strings (e.g. `58,000 km`, `0km (Brand New)`).
 * Returns distance in km, or null when unknown / non-numeric (e.g. "Low Mileage" only).
 */
export function parseMileageKm(raw: string | undefined): number | null {
  if (!raw?.trim()) return null
  const s = raw.trim()
  if (/low\s*mileage/i.test(s) && !/\d/.test(s)) return null
  const m = s.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/)
  if (!m) return null
  const n = Number.parseFloat(m[1])
  if (!Number.isFinite(n) || n < 0) return null
  return Math.round(n)
}
