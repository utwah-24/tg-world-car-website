import { ImageResponse } from "next/og"
import { fetchCarById } from "@/lib/api"
import { getCarShareImage, type Car } from "@/lib/cars-data"
import { imageToDataUri, truncateText } from "@/lib/og-image-utils"
import { getActivePromotions, getDisplayPrice, isCarOnPromo } from "@/lib/promotions"

export const runtime = "edge"

const WIDTH = 1200
const HEIGHT = 630

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const origin = new URL(req.url).origin
  const car = await fetchCarById(id)

  const logoUrl = `${origin}/logos/Logo%20tg2.png`
  const shareImageUrl = car ? getCarShareImage(car as Car) : undefined
  const [logoDataUri, carImageDataUri] = await Promise.all([
    imageToDataUri(logoUrl),
    shareImageUrl ? imageToDataUri(shareImageUrl) : Promise.resolve(null),
  ])

  const displayPrice = car ? getDisplayPrice(car as Car) : null
  const activePromo = car ? getActivePromotions(car as Car)[0] : null
  const onPromo = car ? isCarOnPromo(car as Car) : false
  const yearPrefix = car?.year ? `${car.year} ` : ""
  const carTitle = car ? truncateText(`${yearPrefix}${car.name}`, 52) : "Vehicle unavailable"
  const accent = onPromo ? "#DC2626" : "#2563EB"

  const metaLine = car
    ? [car.mileage, car.fuel, car.transmission].filter(Boolean).join("  ·  ")
    : ""

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0A1628 0%, #132743 55%, #0A1628 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: accent,
            display: "flex",
          }}
        />

        {/* Left — copy */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "58%",
            padding: "48px 40px 40px 56px",
            color: "white",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            {logoDataUri ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoDataUri}
                alt="TG World"
                style={{ height: 52, width: 180, objectFit: "contain", objectPosition: "left center" }}
              />
            ) : (
              <div style={{ fontSize: 28, fontWeight: 700 }}>TG World International</div>
            )}

            {onPromo && (
              <div
                style={{
                  display: "flex",
                  marginTop: 28,
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    background: "#DC2626",
                    color: "white",
                    fontSize: 18,
                    fontWeight: 800,
                    letterSpacing: 1.5,
                    padding: "8px 18px",
                    borderRadius: 999,
                  }}
                >
                  PROMO
                </div>
                {activePromo && (
                  <div
                    style={{
                      display: "flex",
                      color: "#FCA5A5",
                      fontSize: 22,
                      fontWeight: 700,
                    }}
                  >
                    {activePromo.price_reduction_label} OFF
                  </div>
                )}
              </div>
            )}

            <div
              style={{
                display: "flex",
                marginTop: onPromo ? 20 : 32,
                fontSize: 46,
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: -0.5,
              }}
            >
              {carTitle}
            </div>

            {metaLine && (
              <div
                style={{
                  display: "flex",
                  marginTop: 16,
                  fontSize: 22,
                  color: "rgba(255,255,255,0.72)",
                }}
              >
                {truncateText(metaLine, 60)}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {displayPrice?.original && (
              <div
                style={{
                  display: "flex",
                  fontSize: 26,
                  color: "rgba(255,255,255,0.55)",
                  textDecoration: "line-through",
                }}
              >
                {displayPrice.original}
              </div>
            )}
            <div
              style={{
                display: "flex",
                fontSize: 40,
                fontWeight: 800,
                color: onPromo ? "#FCA5A5" : "white",
              }}
            >
              {displayPrice?.current ?? "Contact for price"}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 8,
                fontSize: 20,
                color: "rgba(255,255,255,0.55)",
              }}
            >
              tgworldtz.com
            </div>
          </div>
        </div>

        {/* Right — car photo */}
        <div
          style={{
            display: "flex",
            width: "42%",
            alignItems: "center",
            justifyContent: "center",
            padding: "36px 48px 36px 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              background: "white",
              borderRadius: 24,
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
            }}
          >
            {carImageDataUri ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={carImageDataUri}
                alt={carTitle}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <div style={{ display: "flex", fontSize: 80 }}>🚗</div>
            )}
          </div>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT },
  )
}
