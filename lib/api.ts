const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://tgworld.e-saloon.online'

// ─── In-memory ordered-car accumulator ───────────────────────────────────────
// Keys are ONLY ever added, never removed.
// Within a server process lifetime a car that was once ordered stays hidden
// even if the order is later deleted from /api/orders.
const _orderedKeysAccumulator = new Set<string>()

// API Response Interface (what the API actually returns)
interface RawCarFromAPI {
  car_id: number
  car_name: string
  year?: number
  car_pic: string[] // Now an array of image paths
  car_price: string
  car_description: string
  type?: string
  condition?: string
  company?: string
  brand?: string
  /** Short model code from API (e.g. X3M); distinct from marketing car_name */
  model?: string
  is_coming_soon?: string
  arrival_date?: string
  is_sold?: "available" | "sold"
  /** Odometer or mileage label — numeric strings (`58000`, `58,000 km`) supported when present */
  mileage?: string | number
  /** Alternate API shape */
  car_mileage?: string | number
  /** `"registered"` | `"unregistered"` from Laravel API */
  registration?: string
  /** Dedicated plate/registration number field from the API */
  registration_number?: string | null
  /** true = car is in Dar es Salaam; false = use `location` field */
  in_dar?: boolean | null
  /** Free-text location when in_dar is false */
  location?: string | null
  category?: string
  /** Chassis / VIN — may come as `chassis`, `chasis`, or `chassis_no` from the API */
  chassis?: string
  chasis?: string
  chassis_no?: string
  /** How many units are available; null means the field was not set (older records) */
  total_available?: number | null
  /** When true, the car details page shows the "Book a test drive" banner */
  test_drive_available?: boolean
  /** Optional dealer notes shown on the car details page */
  notes?: string | null
  created_at: string
  updated_at: string
}

interface APIResponse {
  data: RawCarFromAPI[]
}

// Our App Interface (what we use in the app)
export interface CarFromAPI {
  id: string
  name: string
  year?: number
  price: string
  image: string
  images?: string[]
  category: "top-selling" | "coming-soon" | "sold-out"
  type?: string
  condition?: string
  company?: string
  brand?: string
  /** Short model code when API provides it (e.g. X3M) */
  model?: string
  mileage?: string
  transmission?: string
  fuel?: string
  engineSize?: string
  color?: string
  chassis?: string
  seats?: number
  doors?: number
  drive?: string
  features?: string[]
  description?: string
  /** ISO timestamp from API — used for “Latest cars” (30-day window) */
  createdAt?: string
  /** From API `registration` when present (`registered` / `unregistered`) */
  registered?: boolean
  /** Actual plate / registration number when API provides a value that isn't just "registered"/"unregistered" */
  registrationNumber?: string
  /** Display location string — "Dar es Salaam" when in_dar===true, otherwise the location field value */
  location?: string
  /** true when API `in_dar` is set */
  inDar?: boolean
  /** ISO date string from `arrival_date` — present when `is_coming_soon === "set"` */
  arrivalDate?: string
  /** Effective stock count; null means pre-cutoff (treat as 1) */
  totalAvailable?: number | null
  /** When true, show the "Book a test drive" banner on the car details page */
  testDriveAvailable?: boolean
  /** Dealer notes from API; null when empty */
  notes?: string | null
}

/** Map Laravel `registration` string to boolean; unknown/missing → undefined (no UI badge). */
function registrationFromApi(value: string | undefined | null): boolean | undefined {
  if (value == null || typeof value !== "string") return undefined
  const v = value.trim().toLowerCase()
  if (v === "registered") return true
  if (v === "unregistered") return false
  return undefined
}

/**
 * Transform raw API data to our app format.
 * Pass `orderedKeys` (from fetchOrderedCarKeys) to mark ordered cars whose last
 * unit has been reserved as sold-out at the data layer.
 */
function transformCarData(rawCar: RawCarFromAPI, orderedKeys?: Set<string>): CarFromAPI {
  // Safety check: ensure car_pic is an array
  const carPics = Array.isArray(rawCar.car_pic) ? rawCar.car_pic : []
  
  // Find the Front image (case-insensitive, handles spaces and variations)
  // Prioritize exact "front.jpeg" or "front .jpeg" over "front_seats.jpeg"
  const frontImage = carPics.find(img => {
    if (!img) return false
    const lower = img.toLowerCase()
    // Match "front.jpeg", "front .jpeg", etc. but not "front_seats"
    return (lower.includes('/front.jp') || lower.includes('/front .jp')) && 
           !lower.includes('seats') && 
           !lower.includes('_front')
  })
  
  // Fallback to first image if no Front.jpeg found
  const mainImagePath = frontImage || carPics[0] || ''
  const mainImageUrl = mainImagePath ? `${API_BASE_URL}/public/${mainImagePath}` : '/placeholder.svg'
  
  // Convert all images to full URLs
  const allImageUrls = carPics.length > 0 
    ? carPics.map(path => `${API_BASE_URL}/public/${path}`)
    : ['/placeholder.svg']
  
  // Extract year — prefer the API's dedicated year field, then try car_name prefix
  const carName = rawCar.car_name || 'Unknown Car'
  const yearMatch = carName.match(/^(\d{4})/)
  const year: number | undefined = rawCar.year
    ? rawCar.year
    : yearMatch
    ? parseInt(yearMatch[1])
    : undefined

  // Remove year prefix from name if present
  const name = carName.replace(/^\d{4}\s+/, '')
  
  // ── total_available / sold-out logic ──────────────────────────────────────
  // Cars uploaded on/after this date already have total_available set by the API.
  // Cars uploaded before it did not have the field; treat their stock as 1 (available).
  const TOTAL_AVAILABLE_CUTOFF = new Date("2026-05-13T14:32:40.000000Z")
  const carCreatedAt = new Date(rawCar.created_at)
  const rawTotal = rawCar.total_available ?? null
  // Effective stock: for pre-cutoff cars with null total_available → 1; otherwise use the API value
  let effectiveTotalAvailable: number | null =
    rawTotal === null && carCreatedAt < TOTAL_AVAILABLE_CUTOFF ? 1 : rawTotal

  // If this car has an active order AND only 1 unit was available, it is now effectively 0
  if (orderedKeys && effectiveTotalAvailable === 1) {
    // Primary: match by car_id (most reliable)
    const isOrderedById = orderedKeys.has(`id:${rawCar.car_id}`)
    // Fallback: name-based matching for older orders without car_id
    const keyFullName = normalizeOrderKey(carName)
    const keyStrippedName = normalizeOrderKey(name, year)
    const isOrderedByName = orderedKeys.has(keyFullName) || orderedKeys.has(keyStrippedName)
    if (isOrderedById || isOrderedByName) {
      effectiveTotalAvailable = 0
    }
  }

  // Determine category — sold status comes from is_sold field OR total_available reaching 0
  let category: "top-selling" | "coming-soon" | "sold-out" = "top-selling"

  if (rawCar.is_sold === "sold" || effectiveTotalAvailable === 0) {
    category = "sold-out"
  } else if (rawCar.is_coming_soon === "set") {
    category = "coming-soon"
  } else if (rawCar.category) {
    const apiCategory = rawCar.category.toUpperCase()
    if (apiCategory === "TRUCKS") {
      category = "coming-soon"
    }
    // All other category values default to "top-selling"
  }
  
  // Extract additional info from description (with null checks)
  const description = rawCar.car_description || ''
  const transmission = description.match(/Transmission\s*:\s*([^\r\n]+)/i)?.[1]?.trim()
  const fuel = description.match(/Fuel\s*:\s*([^\r\n]+)/i)?.[1]?.trim()
  const mileageLineFromDesc = description.match(/Mileage\s*:\s*([^\r\n]+)/i)?.[1]?.trim()
  const mileageApiRaw =
    rawCar.mileage ??
    rawCar.car_mileage ??
    undefined
  const mileageApi =
    mileageApiRaw != null && String(mileageApiRaw).trim() !== ""
      ? String(mileageApiRaw).trim()
      : undefined
  const mileage = mileageApi ?? mileageLineFromDesc
  const color = description.match(/Colou?r\s*:\s*([^\r\n]+)/i)?.[1]?.trim()

  // Chassis: prefer dedicated API field; fall back to parsing description text
  const chassisFromApi =
    (typeof rawCar.chassis === 'string' && rawCar.chassis.trim()) ||
    (typeof rawCar.chasis === 'string' && rawCar.chasis.trim()) ||
    (typeof rawCar.chassis_no === 'string' && rawCar.chassis_no.trim()) ||
    undefined
  const chassisFromDesc = (() => {
    const t = description.replace(/\s+/g, ' ')
    const m1 = t.match(/(?:CHASSIS|CHASIS|VIN|FRAME)\s*[:#]?\s*([A-Z0-9][A-Z0-9\s-]{5,})/i)
    if (m1?.[1]) return m1[1].replace(/\s+/g, '').toUpperCase()
    const m2 = t.match(/\b([A-HJ-NPR-Z0-9]{17})\b/)
    return m2?.[1] ?? undefined
  })()
  const chassis = chassisFromApi || chassisFromDesc || undefined
  
  const registered = registrationFromApi(rawCar.registration)
  // Prefer the dedicated registration_number field; fall back to extracting a plate from registration
  const registrationNumber = (() => {
    if (rawCar.registration_number && rawCar.registration_number.trim())
      return rawCar.registration_number.trim()
    if (!rawCar.registration) return undefined
    const v = rawCar.registration.trim().toLowerCase()
    if (v === "registered" || v === "unregistered" || v === "") return undefined
    return rawCar.registration.trim()
  })()

  // Clean up price - remove "With New Registration" and other common suffixes
  let cleanPrice = rawCar.car_price || 'Contact for price'
  cleanPrice = cleanPrice.replace(/\s*With New Registration\s*/gi, '')
  cleanPrice = cleanPrice.replace(/\s*with registration\s*/gi, '')
  cleanPrice = cleanPrice.trim()
  
  return {
    id: rawCar.car_id.toString(),
    name,
    year,
    price: cleanPrice,
    // A plate number implies the car is registered
    registered: registrationNumber ? true : registered,
    registrationNumber,
    image: mainImageUrl,
    images: allImageUrls,
    category,
    type: rawCar.type,
    condition: rawCar.condition,
    company: rawCar.company,
    brand: rawCar.brand,
    model: rawCar.model?.trim() || undefined,
    transmission,
    fuel,
    mileage,
    color,
    chassis,
    description,
    createdAt: rawCar.created_at,
    totalAvailable: effectiveTotalAvailable,
    inDar: rawCar.in_dar === true,
    location: rawCar.in_dar === true
      ? "Dar es Salaam"
      : (rawCar.location?.trim() || undefined),
    arrivalDate: (() => {
      const d = rawCar.arrival_date
      if (!d || d.startsWith("0000")) return undefined
      return d
    })(),
    testDriveAvailable: rawCar.test_drive_available === true,
    notes: rawCar.notes?.trim() ? rawCar.notes.trim() : null,
  }
}

/**
 * Fetch all cars from the API
 */
export async function fetchCars(orderedKeys?: Set<string>): Promise<CarFromAPI[]> {
  try {
    // next: { revalidate: 0 } keeps data fresh while still allowing Next.js to
    // deduplicate simultaneous calls within the same server render (unlike 'no-store').
    const response = await fetch(`${API_BASE_URL}/api/cars`, {
      next: { revalidate: 0 },
      headers: {
        'Accept': 'application/json',
      }
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const apiResponse: APIResponse = await response.json()
    
    // Transform the raw API data to our app format
    const transformedCars = apiResponse.data.map(rawCar => transformCarData(rawCar, orderedKeys))
    
    console.log(`✅ Successfully fetched ${transformedCars.length} cars from API`)
    return transformedCars
  } catch (error) {
    console.error('❌ Error fetching cars from API:', error)
    // Return empty array on error so fallback data will be used
    return []
  }
}

/**
 * Fetch a single car by ID
 */
export async function fetchCarById(id: string): Promise<CarFromAPI | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cars/${id}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      }
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const rawCar: RawCarFromAPI = await response.json()
    return transformCarData(rawCar)
  } catch (error) {
    console.error(`❌ Error fetching car ${id}:`, error)
    return null
  }
}

/**
 * Fetch cars by category
 */
export async function fetchCarsByCategory(category: "top-selling" | "coming-soon" | "sold-out"): Promise<CarFromAPI[]> {
  try {
    // Fetch all cars and filter by category
    // (API doesn't seem to support category filtering yet)
    const allCars = await fetchCars()
    return allCars.filter(car => car.category === category)
  } catch (error) {
    console.error(`❌ Error fetching cars for category ${category}:`, error)
    return []
  }
}

/**
 * Fetch third-party cars from the API
 */
export async function fetchThirdPartyCars(orderedKeys?: Set<string>): Promise<CarFromAPI[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/third-party`, {
      next: { revalidate: 0 },
      headers: {
        'Accept': 'application/json',
      }
    })
    
    if (!response.ok) {
      console.log(`Third-party API returned ${response.status}, no third-party cars available`)
      return []
    }
    
    const apiResponse: APIResponse = await response.json()
    
    // Transform the raw API data to our app format
    const transformedCars = apiResponse.data.map(rawCar => {
      const transformed = transformCarData(rawCar, orderedKeys)
      // Mark as third-party and add identifier to description
      return {
        ...transformed,
        category: "coming-soon" as const,
        description: `[THIRD_PARTY] ${transformed.description}`, // Add marker for filtering
      }
    })
    
    console.log(`✅ Successfully fetched ${transformedCars.length} third-party cars from API`)
    return transformedCars
  } catch (error) {
    console.error('❌ Error fetching third-party cars from API:', error)
    return []
  }
}

// Content/Video API interfaces
interface ContentFromAPI {
  contentID: number
  content_name: string
  content_video: string
  duration: string | null
  car_id?: number
  created_at: string
  updated_at: string
}

interface ContentAPIResponse {
  data: ContentFromAPI[]
}

export interface ContentVideo {
  id: string
  title: string
  videoUrl: string
  duration?: string
  carId?: string
}

/**
 * Fetch content videos from the API
 */
export async function fetchContent(): Promise<ContentVideo[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/content`, {
      next: { revalidate: 0 },
      headers: {
        'Accept': 'application/json',
      }
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const apiResponse: ContentAPIResponse = await response.json()
    
    // Transform to our format
    const transformedContent = apiResponse.data.map(content => ({
      id: content.contentID.toString(),
      title: content.content_name,
      videoUrl: `${API_BASE_URL}/public/${content.content_video}`,
      duration: content.duration || undefined,
      carId: content.car_id?.toString(),
    }))
    
    console.log(`✅ Successfully fetched ${transformedContent.length} content videos from API`)
    return transformedContent
  } catch (error) {
    console.error('❌ Error fetching content from API:', error)
    return []
  }
}

// ─── Orders ──────────────────────────────────────────────────────────────────

interface RawOrder {
  id: number
  car_id?: number | null
  car_name: string
  year?: string | number | null
  status?: boolean | null
}

/**
 * Normalise a car name + year into a stable lookup key.
 * Strips punctuation, collapses spaces, lower-cases everything.
 */
export function normalizeOrderKey(name: string, year?: string | number | null): string {
  const n = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  return year != null ? `${year}-${n}` : n
}

/**
 * Returns a Set of `"year-normalizedName"` keys for every car that has EVER
 * had an order during this server process lifetime.
 *
 * - Called on every request (cache: "no-store") so new orders are seen
 *   immediately on the next page load / refresh.
 * - Keys are only ever ADDED to `_orderedKeysAccumulator`, never removed —
 *   so deleting an order from the API will NOT bring the car back.
 */
export async function fetchOrderedCarKeys(): Promise<Set<string>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    })
    if (res.ok) {
      const json = await res.json()
      const orders: RawOrder[] = Array.isArray(json?.data) ? json.data : []
      for (const o of orders) {
        // Primary: match by car_id when the order has it
        if (o.car_id != null) {
          _orderedKeysAccumulator.add(`id:${o.car_id}`)
        }
        // Fallback: name-based matching for orders without car_id
        if (o.car_name) {
          _orderedKeysAccumulator.add(normalizeOrderKey(o.car_name, o.year))
          _orderedKeysAccumulator.add(normalizeOrderKey(o.car_name))
        }
      }
    }
  } catch {
    // network failure — return whatever we've accumulated so far
  }
  return _orderedKeysAccumulator
}

/** Primary TG WORLD International logo (`public/logos/Logo tg1.png`) */
export const SITE_LOGO_PATH = "/logos/Logo%20tg1.png"

/**
 * Site header/footer logos (static asset; replaces legacy /api/logos).
 */
export async function fetchLogos(): Promise<{ light: string; dark: string }> {
  return { light: SITE_LOGO_PATH, dark: SITE_LOGO_PATH }
}

export interface CompanyLogo {
  company: string
  logoUrl: string
}

/**
 * Fetch car company logos from the API
 */
export async function fetchCompanyLogos(): Promise<CompanyLogo[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/companies`, {
      next: { revalidate: 0 },
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      console.log(`Companies API returned ${response.status}`)
      return []
    }

    const json = await response.json()
    const rows = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : []

    const logos: CompanyLogo[] = rows
      .map((row: Record<string, unknown>) => {
        const name =
          (typeof row.company_label === 'string' && row.company_label) ||
          (typeof row.company === 'string' && row.company) ||
          (typeof row.name === 'string' && row.name) ||
          (typeof row.company_name === 'string' && row.company_name) ||
          ''
        const pathRaw =
          (typeof row.company_logo_path === 'string' && row.company_logo_path) ||
          (typeof row.logo === 'string' && row.logo) ||
          (typeof row.company_logo === 'string' && row.company_logo) ||
          (typeof row.logo_path === 'string' && row.logo_path) ||
          (typeof row.path === 'string' && row.path) ||
          ''
        if (!name || !pathRaw) return null
        const logoUrl = pathRaw.startsWith('http')
          ? pathRaw
          : `${API_BASE_URL}/public/${pathRaw.replace(/^\//, '')}`
        return { company: name.trim(), logoUrl }
      })
      .filter(Boolean) as CompanyLogo[]

    console.log(`✅ Successfully fetched ${logos.length} company logos from API`)
    return logos
  } catch (error) {
    console.error('❌ Error fetching company logos from API:', error)
    return []
  }
}
