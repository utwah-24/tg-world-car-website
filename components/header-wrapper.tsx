import { Header } from "./header"
import { fetchCompanyLogos, fetchLogos, type CompanyLogo } from "@/lib/api"
import { isThirdPartyCar, isCarAvailableNow, getAllCars, type Car } from "@/lib/cars-data"
import { normalizeCarType } from "@/lib/car-type"
import { parsePriceMillions } from "@/lib/find-your-car-filter"
import { isCarInLatestWindow } from "@/lib/latest-cars"
import { parseMileageKm } from "@/lib/mileage-km"

function availableStockCars(cars: Car[]): Car[] {
  return cars.filter(isCarAvailableNow)
}

function companyKey(value: string | undefined): string {
  return (value || "").toLowerCase().replace(/[^a-z0-9]/g, "")
}

function buildStockCompanies(companies: CompanyLogo[], cars: Car[]) {
  return companies.map((company) => ({
    label: company.company,
    logoUrl: company.logoUrl,
    href: `/shop?stock=list&company=${encodeURIComponent(company.company)}`,
    count: cars.filter((car) => companyKey(car.company) === companyKey(company.company)).length,
  }))
}

function buildStockCounts(cars: Car[]): Record<string, number> {
  const countWhere = (href: string, predicate: (car: Car) => boolean): [string, number] => [
    href,
    cars.filter(predicate).length,
  ]

  return Object.fromEntries([
    countWhere("/shop?stock=list&category=suv", (car) => normalizeCarType(car.type || "") === "suv"),
    countWhere("/shop?stock=list&category=crossover_suv", (car) => normalizeCarType(car.type || "") === "crossover_suv"),
    countWhere("/shop?stock=list&category=pickup", (car) => normalizeCarType(car.type || "") === "pickup"),
    countWhere("/shop?stock=list&category=sedan", (car) => normalizeCarType(car.type || "") === "sedan"),
    countWhere("/shop?stock=list&category=van", (car) => normalizeCarType(car.type || "") === "van"),
    countWhere("/shop?stock=list&category=truck", (car) => normalizeCarType(car.type || "") === "truck"),

    countWhere("/shop?stock=list&price=price-under-20", (car) => {
      const pm = parsePriceMillions(car.price || "")
      return pm != null && pm < 20
    }),
    countWhere("/shop?stock=list&price=price-20-40", (car) => {
      const pm = parsePriceMillions(car.price || "")
      return pm != null && pm >= 20 && pm < 40
    }),
    countWhere("/shop?stock=list&price=price-40-60", (car) => {
      const pm = parsePriceMillions(car.price || "")
      return pm != null && pm >= 40 && pm < 60
    }),
    countWhere("/shop?stock=list&price=price-60-80", (car) => {
      const pm = parsePriceMillions(car.price || "")
      return pm != null && pm >= 60 && pm < 80
    }),
    countWhere("/shop?stock=list&price=price-80-100", (car) => {
      const pm = parsePriceMillions(car.price || "")
      return pm != null && pm >= 80 && pm < 100
    }),
    countWhere("/shop?stock=list&price=price-100-150", (car) => {
      const pm = parsePriceMillions(car.price || "")
      return pm != null && pm >= 100 && pm < 150
    }),
    countWhere("/shop?stock=list&price=price-180-plus", (car) => {
      const pm = parsePriceMillions(car.price || "")
      return pm != null && pm >= 180
    }),

    countWhere("/shop?stock=list&latest=1", (car) => isCarInLatestWindow(car.createdAt)),
    countWhere("/shop?stock=list&in_dar=1", (car) => car.inDar === true),
    countWhere("/shop?stock=list&condition=new", (car) => (car.condition || "").toLowerCase() === "new"),
    countWhere("/shop?stock=list&condition=second_hand", (car) => (car.condition || "").toLowerCase() === "second_hand"),
    countWhere("/shop?stock=list&condition=third_party", (car) => isThirdPartyCar(car)),
    countWhere("/shop?stock=list&registration=registered", (car) => car.registered === true),
    countWhere("/shop?stock=list&registration=unregistered", (car) => car.registered === false),
    countWhere("/shop?stock=list&mileage=mileage-over-50k", (car) => {
      const km = parseMileageKm(car.mileage)
      return km != null && km > 50_000
    }),
  ])
}

export async function HeaderWrapper() {
  const [logos, allCars, companyLogos] = await Promise.all([fetchLogos(), getAllCars(), fetchCompanyLogos()])
  const stockCars = availableStockCars(allCars)

  return (
    <Header
      logoLight={logos.light}
      logoDark={logos.dark}
      stockCompanies={buildStockCompanies(companyLogos, stockCars)}
      stockCounts={buildStockCounts(stockCars)}
      totalStockCount={stockCars.length}
    />
  )
}
