import { fetchCars, fetchCarsByCategory, fetchThirdPartyCars, fetchOrderedCarKeys, fetchSoldCars, normalizeOrderKey, type CarFromAPI } from './api'

export interface Car {
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
  /** Short model code from API (e.g. X3M); preferred over full name for filters */
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
  createdAt?: string
  /** From API `registration`; when set, car cards show Registered / Unregistered */
  registered?: boolean
  /** Actual plate / registration number when the API provides one */
  registrationNumber?: string
  /** Display location — "Dar es Salaam" when in_dar is true, otherwise the location field from API */
  location?: string
  /** true when API `in_dar` is set */
  inDar?: boolean
  /** ISO date string — only set when car has `is_coming_soon === "set"` and `arrival_date` from the API */
  arrivalDate?: string
  /** Effective stock count; null = pre-cutoff (treat as 1); 0 = sold out */
  totalAvailable?: number | null
  /** When true, show the "Book a test drive" banner on the car details page */
  testDriveAvailable?: boolean
  /** Dealer notes from API; null when empty */
  notes?: string | null
}

/** Third-party: `condition` from the main API and/or `[THIRD_PARTY]` from the partner feed */
export function isThirdPartyCar(car: Car): boolean {
  if ((car.condition || "").toLowerCase().trim() === "third_party") return true
  return (car.description || "").toLowerCase().includes("[third_party]")
}

// Type alias for compatibility
export type { CarFromAPI }

export const cars: Car[] = [
  // Top Selling Cars - Using placeholder, real data comes from API
  {
    id: "1",
    name: "Toyota Land Cruiser ZX",
    year: 2024,
    price: "375,000,000 TZS",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "top-selling",
    mileage: "0km (Brand New)",
    transmission: "Automatic 10 Speed",
    fuel: "Petrol",
    engineSize: "3,500cc Twin Turbo",
    color: "Pearl White",
    seats: 7,
    doors: 5,
    drive: "4WD",
    features: ["Sunroof", "Leather Seats", "Power Folding Third Row Seats", "12.3 Inch Touchscreen", "JBL Audio System"],
    description: "Brand New 2024 TOYOTA LANDCRUISER ZX 3.5L Twin Turbo Petrol. Experience unmatched luxury and off-road capability with this brand new Land Cruiser ZX featuring a powerful twin turbo engine, premium interior, and advanced technology."
  },
  {
    id: "2",
    name: "Range Rover Sport Autobiography",
    year: 2024,
    price: "520,000,000 TZS",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "top-selling",
    mileage: "4,700 km",
    transmission: "Automatic 8 Speed",
    fuel: "Diesel",
    engineSize: "3,000cc",
    color: "Carpathian Gray",
    seats: 5,
    drive: "AWD",
    features: ["13.1 TouchScreen", "Wireless CarPlay", "3D Surround Camera", "Panoramic Sunroof", "Meridian Sound System"],
    description: "2024 RANGE ROVER SPORTS AUTOBIOGRAPHY 3.0 Diesel. The pinnacle of British luxury SUVs with commanding presence, exceptional performance, and world-class craftsmanship."
  },
  {
    id: "3",
    name: "Toyota Land Cruiser Sahara",
    year: 2024,
    price: "395,000,000 TZS",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "top-selling",
    mileage: "22,000 km",
    transmission: "Automatic",
    fuel: "Diesel",
    engineSize: "3,300cc Twin Turbo",
    seats: 5,
    doors: 5,
    drive: "4WD",
    features: ["12.3 Inch Infotainment Screen", "360 Camera", "Wireless Charger", "Alloy Wheels", "Cruise Control", "Leather Seats", "Daylight LED"],
    description: "2024 TOYOTA LANDCRUISER SAHARA ZX 3.3L Twin Turbo Diesel. Desert-proven durability meets modern sophistication in this legendary SUV with advanced features."
  },
  // Cars Coming Soon
  {
    id: "4",
    name: "Ford Ranger Wildtrack",
    year: 2023,
    price: "155,000,000 TZS",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "coming-soon",
    mileage: "Low Mileage",
    transmission: "Automatic",
    fuel: "Diesel",
    engineSize: "2,000cc",
    color: "White",
    seats: 5,
    features: ["Daylight LED", "Leather Seats", "Push Start", "Alloy Wheels", "Android", "CarPlay"],
    description: "2023 FORD RANGER WILDTRACK. Adventure awaits with this rugged pickup featuring advanced tech and bold styling for those who demand more."
  },
  {
    id: "5",
    name: "Toyota Fortuner",
    year: 2023,
    price: "165,000,000 TZS",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "coming-soon",
    mileage: "Low Mileage",
    transmission: "Automatic",
    fuel: "Diesel",
    engineSize: "2,400cc",
    color: "White",
    seats: 7,
    doors: 5,
    drive: "4WD",
    features: ["Leather Seats", "Alloy Wheels", "Daylight Running Lights", "Push Start"],
    description: "2023 TOYOTA FORTUNER 2.4L Diesel 4x4. The versatile family SUV that conquers any terrain with spacious seating for 7."
  },
  {
    id: "6",
    name: "Scania Dump Truck 94C-300",
    year: 2003,
    price: "185,000,000 TZS",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "coming-soon",
    transmission: "Manual",
    fuel: "Diesel",
    color: "Orange",
    features: ["Driver Bed", "FM Radio", "Fog Lights", "AC", "Sports Lights"],
    description: "2003 SCANIA DUMP TRUCK 94C-300. Heavy-duty 8x4 dump truck with 25-ton carrying capacity. Built for serious construction work."
  },
  {
    id: "7",
    name: "Scania Dump Truck 124C-380",
    year: 2004,
    price: "185,000,000 TZS",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "coming-soon",
    transmission: "Manual",
    fuel: "Diesel",
    color: "Multi",
    features: ["Driver Bed", "FM Radio", "Fog Lights", "AC", "Sports Lights"],
    description: "2004 SCANIA DUMP TRUCK 124C-380. Powerful 8x4 dump truck with 25-ton carrying capacity. Perfect for construction and mining operations."
  },
  // Previously sold cars — sold status now comes from API (is_sold field) only
  {
    id: "8",
    name: "Subaru Forester SJ5",
    year: 2015,
    price: "37,500,000 TZS",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "top-selling",
    mileage: "58,000 km",
    transmission: "Automatic",
    fuel: "Petrol",
    engineSize: "2,000cc",
    color: "Pearl White",
    seats: 5,
    drive: "AWD",
    features: ["Push Start", "Alloy Wheels", "Fog Lights", "Daylight LED", "Roof Rails", "Rear Spoiler"],
    description: "2015 SUBARU FORESTER SJ5 2.0L Petrol. Reliable all-wheel drive performance with low mileage. Perfect for city driving and weekend adventures."
  },
  {
    id: "9",
    name: "Toyota Harrier 240G",
    year: 2007,
    price: "37,500,000 TZS",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "top-selling",
    mileage: "47,518 km",
    transmission: "Automatic",
    fuel: "Petrol",
    engineSize: "2,360cc",
    color: "Pearl",
    seats: 5,
    doors: 5,
    drive: "2WD",
    description: "2007 TOYOTA Harrier 240G L Package. Classic crossover SUV with premium features and low mileage. Comfortable, economical, and built to last."
  },
  {
    id: "10",
    name: "Toyota Land Cruiser ZX",
    year: 2011,
    price: "152,500,000 TZS",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "top-selling",
    mileage: "Low Mileage",
    transmission: "Automatic",
    fuel: "Petrol",
    color: "Pearl",
    seats: 7,
    drive: "4x4",
    features: ["Leather Seats", "Alloy Wheels", "Fog Lights", "Daylight LED", "Push Start"],
    description: "2011 TOYOTA LANDCRUISER ZX. Timeless Land Cruiser design with powerful 1UR petrol engine. Built for those who value durability and comfort."
  },
]

/** Returns true when the car has an active order and should be hidden. */
async function buildOrderFilter(): Promise<(car: Car) => boolean> {
  const orderedKeys = await fetchOrderedCarKeys()
  return (car: Car) => orderedKeys.has(normalizeOrderKey(car.name, car.year))
}

// Helper functions to get cars by category (now async to support API)
export const getTopSellingCars = async (): Promise<Car[]> => {
  try {
    const [apiCars, isOrdered] = await Promise.all([
      fetchCarsByCategory("top-selling"),
      buildOrderFilter(),
    ])
    if (apiCars && apiCars.length > 0) {
      return apiCars.filter(car => !isOrdered(car))
    }
  } catch (error) {
    console.error('Error fetching top selling cars from API, falling back to static data:', error)
  }
  return cars.filter(car => car.category === "top-selling")
}

export const getComingSoonCars = async (): Promise<Car[]> => {
  try {
    const [apiCars, isOrdered] = await Promise.all([
      fetchCarsByCategory("coming-soon"),
      buildOrderFilter(),
    ])
    if (apiCars && apiCars.length > 0) {
      // Only include cars that truly have is_coming_soon set — indicated by a valid arrivalDate
      return apiCars.filter(car => !isOrdered(car) && !!car.arrivalDate)
    }
  } catch (error) {
    console.error('Error fetching coming soon cars from API, falling back to static data:', error)
  }
  return cars.filter(car => car.category === "coming-soon")
}

export const getSoldOutCars = async (): Promise<Car[]> => {
  try {
    const [apiCars, isOrdered] = await Promise.all([
      fetchCarsByCategory("sold-out"),
      buildOrderFilter(),
    ])
    if (apiCars && apiCars.length > 0) {
      return apiCars.filter(car => !isOrdered(car))
    }
  } catch (error) {
    console.error('Error fetching sold out cars from API, falling back to static data:', error)
  }
  return cars.filter(car => car.category === "sold-out")
}

/** Sold vehicles from /api/sold-cars for shop display. */
export const getSoldCarsForShop = async (inventory?: Car[]): Promise<Car[]> => {
  try {
    const soldCars = await fetchSoldCars(inventory)
    if (soldCars.length > 0) return soldCars
  } catch (error) {
    console.error('Error fetching sold cars for shop:', error)
  }
  return []
}

// Function to get all cars from API or fallback to static data
export const getAllCars = async (): Promise<Car[]> => {
  try {
    // Fetch ordered keys first so transformCarData can mark ordered single-unit
    // cars as sold-out at the source, regardless of how the name is stored in orders.
    const orderedKeys = await fetchOrderedCarKeys()

    const [apiCars, thirdPartyCars] = await Promise.all([
      fetchCars(orderedKeys),
      fetchThirdPartyCars(orderedKeys),
    ])

    // Combine and deduplicate cars by ID
    // If a car exists in both, prefer the third-party version
    const carMap = new Map<string, Car>()

    // Add regular cars first
    apiCars?.forEach(car => {
      carMap.set(car.id, car)
    })

    // Add/override with third-party cars (they take priority)
    thirdPartyCars?.forEach(car => {
      carMap.set(car.id, car)
    })

    const allCars = Array.from(carMap.values())

    if (allCars.length > 0) {
      return allCars
    }
  } catch (error) {
    console.error('Error fetching all cars from API, falling back to static data:', error)
  }
  // Fallback to static data if API fails
  return cars
}

// Function to get only third-party cars
export const getThirdPartyCars = async (): Promise<Car[]> => {
  try {
    const thirdPartyCars = await fetchThirdPartyCars()
    if (thirdPartyCars && thirdPartyCars.length > 0) {
      return thirdPartyCars
    }
  } catch (error) {
    console.error('Error fetching third-party cars from API:', error)
  }
  return []
}
