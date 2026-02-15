import { fetchCars, fetchCarsByCategory, fetchThirdPartyCars, type CarFromAPI } from './api'

export interface Car {
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
  // Sold Out Cars
  {
    id: "8",
    name: "Subaru Forester SJ5",
    year: 2015,
    price: "37,500,000 TZS",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "sold-out",
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
    category: "sold-out",
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
    category: "sold-out",
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

// Helper functions to get cars by category (now async to support API)
export const getTopSellingCars = async (): Promise<Car[]> => {
  try {
    const apiCars = await fetchCarsByCategory("top-selling")
    if (apiCars && apiCars.length > 0) {
      return apiCars
    }
  } catch (error) {
    console.error('Error fetching top selling cars from API, falling back to static data:', error)
  }
  // Fallback to static data if API fails
  return cars.filter(car => car.category === "top-selling")
}

export const getComingSoonCars = async (): Promise<Car[]> => {
  try {
    const apiCars = await fetchCarsByCategory("coming-soon")
    if (apiCars && apiCars.length > 0) {
      return apiCars
    }
  } catch (error) {
    console.error('Error fetching coming soon cars from API, falling back to static data:', error)
  }
  // Fallback to static data if API fails
  return cars.filter(car => car.category === "coming-soon")
}

export const getSoldOutCars = async (): Promise<Car[]> => {
  try {
    const apiCars = await fetchCarsByCategory("sold-out")
    if (apiCars && apiCars.length > 0) {
      return apiCars
    }
  } catch (error) {
    console.error('Error fetching sold out cars from API, falling back to static data:', error)
  }
  // Fallback to static data if API fails
  return cars.filter(car => car.category === "sold-out")
}

// Function to get all cars from API or fallback to static data
export const getAllCars = async (): Promise<Car[]> => {
  try {
    const [apiCars, thirdPartyCars] = await Promise.all([
      fetchCars(),
      fetchThirdPartyCars()
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
