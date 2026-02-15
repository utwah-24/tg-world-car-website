const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://tgworld.e-saloon.online'

// API Response Interface (what the API actually returns)
interface RawCarFromAPI {
  car_id: number
  car_name: string
  car_pic: string[] // Now an array of image paths
  car_price: string
  car_description: string
  category?: string
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
  year: number
  price: string
  image: string
  images?: string[]
  category: "top-selling" | "coming-soon" | "sold-out"
  mileage?: string
  transmission?: string
  fuel?: string
  engineSize?: string
  color?: string
  seats?: number
  doors?: number
  drive?: string
  features?: string[]
  description?: string
}

/**
 * Transform raw API data to our app format
 */
function transformCarData(rawCar: RawCarFromAPI): CarFromAPI {
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
  
  // Extract year from car name (e.g., "2024 Toyota...")
  const carName = rawCar.car_name || 'Unknown Car'
  const yearMatch = carName.match(/^(\d{4})/)
  const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear()
  
  // Remove year from name to get clean car name
  const name = carName.replace(/^\d{4}\s+/, '')
  
  // Determine category based on API category field or description
  let category: "top-selling" | "coming-soon" | "sold-out" = "top-selling"
  
  if (rawCar.category) {
    // Map API categories to our app categories
    const apiCategory = rawCar.category.toUpperCase()
    
    // Map based on your API categories
    switch(apiCategory) {
      case 'TRUCKS':
        category = "coming-soon"
        break
      case 'SUV':
        // Distribute SUVs across categories based on year
        if (year >= 2023) {
          category = "top-selling"
        } else if (year >= 2015) {
          category = "coming-soon"
        } else {
          category = "sold-out"
        }
        break
      case 'SOLD':
      case 'SOLD-OUT':
        category = "sold-out"
        break
      default:
        category = "top-selling"
    }
  } else if (rawCar.car_description && rawCar.car_description.toLowerCase().includes('sold')) {
    category = "sold-out"
  } else if (rawCar.car_description && rawCar.car_description.toLowerCase().includes('coming soon')) {
    category = "coming-soon"
  }
  
  // Extract additional info from description (with null checks)
  const description = rawCar.car_description || ''
  const transmission = description.match(/Transmission\s*:\s*([^\r\n]+)/i)?.[1]?.trim()
  const fuel = description.match(/Fuel\s*:\s*([^\r\n]+)/i)?.[1]?.trim()
  const mileage = description.match(/Mileage\s*:\s*([^\r\n]+)/i)?.[1]?.trim()
  const color = description.match(/Colou?r\s*:\s*([^\r\n]+)/i)?.[1]?.trim()
  
  return {
    id: rawCar.car_id.toString(),
    name,
    year,
    price: rawCar.car_price || 'Contact for price',
    image: mainImageUrl, // Always use Front.jpeg
    images: allImageUrls, // All images available
    category,
    transmission,
    fuel,
    mileage,
    color,
    description,
  }
}

/**
 * Fetch all cars from the API
 */
export async function fetchCars(): Promise<CarFromAPI[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cars`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
      headers: {
        'Accept': 'application/json',
      }
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const apiResponse: APIResponse = await response.json()
    
    // Transform the raw API data to our app format
    const transformedCars = apiResponse.data.map(transformCarData)
    
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
      next: { revalidate: 60 },
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

// Logo API interfaces
interface LogoFromAPI {
  id: number
  name: string
  path: string
  created_at: string
  updated_at: string
}

interface LogosAPIResponse {
  data: LogoFromAPI[]
}

/**
 * Fetch third-party cars from the API
 */
export async function fetchThirdPartyCars(): Promise<CarFromAPI[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/third-party`, {
      next: { revalidate: 60 },
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
      const transformed = transformCarData(rawCar)
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
}

/**
 * Fetch content videos from the API
 */
export async function fetchContent(): Promise<ContentVideo[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/content`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
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
    }))
    
    console.log(`✅ Successfully fetched ${transformedContent.length} content videos from API`)
    return transformedContent
  } catch (error) {
    console.error('❌ Error fetching content from API:', error)
    return []
  }
}

/**
 * Fetch logos from the API
 */
export async function fetchLogos(): Promise<{ light: string; dark: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/logos`, {
      next: { revalidate: 3600 }, // Revalidate every hour (logos don't change often)
      headers: {
        'Accept': 'application/json',
      }
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const apiResponse: LogosAPIResponse = await response.json()
    
    // Find light and dark logos
    const lightLogo = apiResponse.data.find(logo => logo.name.includes('light'))
    const darkLogo = apiResponse.data.find(logo => logo.name.includes('dark'))
    
    return {
      light: lightLogo ? `${API_BASE_URL}/public/${lightLogo.path}` : '/placeholder-logo.svg',
      dark: darkLogo ? `${API_BASE_URL}/public/${darkLogo.path}` : '/placeholder-logo.svg',
    }
  } catch (error) {
    console.error('❌ Error fetching logos from API:', error)
    // Return placeholder on error
    return {
      light: '/placeholder-logo.svg',
      dark: '/placeholder-logo.svg',
    }
  }
}
