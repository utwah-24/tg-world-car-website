import { NextResponse } from "next/server"
import { getAllCars, getCarShareImage, isCarAvailableNow } from "@/lib/cars-data"
import { getDisplayPrice } from "@/lib/promotions"
import { parsePriceMillions } from "@/lib/find-your-car-filter"

export const revalidate = 0

const SITE_URL = "https://tgworldtz.com"

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

/** Meta / Instagram product catalog CSV for carousel & collection ads. */
export async function GET() {
  const allCars = await getAllCars()
  const cars = allCars.filter(isCarAvailableNow)

  const header = [
    "id",
    "title",
    "description",
    "availability",
    "condition",
    "price",
    "link",
    "image_link",
    "brand",
  ].join(",")

  const rows = cars.map((car) => {
    const yearPrefix = car.year ? `${car.year} ` : ""
    const title = `${yearPrefix}${car.name}`.trim()
    const { current: priceLabel } = getDisplayPrice(car)
    const priceMillions = parsePriceMillions(priceLabel)
    const price = priceMillions != null ? `${Math.round(priceMillions * 1_000_000)} TZS` : "0 TZS"
    const image = getCarShareImage(car) ?? ""
    const link = `${SITE_URL}/car/${car.id}`
    const description = [priceLabel, car.mileage, car.fuel].filter(Boolean).join(" · ")
    const condition = (car.condition || "used").replace(/_/g, " ")

    return [
      car.id,
      title,
      description,
      "in stock",
      condition,
      price,
      link,
      image,
      car.company || car.brand || "TG World",
    ].map((v) => csvEscape(String(v))).join(",")
  })

  const csv = [header, ...rows].join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'inline; filename="tg-world-catalog.csv"',
      "Cache-Control": "no-store",
    },
  })
}
