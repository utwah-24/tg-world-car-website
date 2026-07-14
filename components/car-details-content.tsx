"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, MapPin, Fuel, Gauge, Calendar, Car as CarIcon, DollarSign, Cog, Palette, Settings, Users, Check, Link as LinkIcon, CheckCheck, Download, Phone } from "lucide-react"
import type { Car } from "@/lib/cars-data"
import { isThirdPartyCar, isCarAvailableNow } from "@/lib/cars-data"
import { DEALER_CONTACTS, tzPhoneHref, tzWhatsAppHref } from "@/lib/dealer-contacts"
import { CarCard } from "@/components/car-card"
import { CarPrice } from "@/components/car-price"
import { formatPromoDateRange, getActivePromotions, getDisplayPrice } from "@/lib/promotions"

interface CarDetailsContentProps {
  car: Car
  relatedCars?: Car[]
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

/** CRC-32 for ZIP local file headers — standard table-based implementation */
function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

export function CarDetailsContent({ car, relatedCars = [] }: CarDetailsContentProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const images = car.images && car.images.length > 0 ? car.images : [car.image]
  const yearPrefix = car.year ? `${car.year} ` : ""
  const isThirdParty = isThirdPartyCar(car)
  const activePromotions = getActivePromotions(car)
  const displayPrice = getDisplayPrice(car)

  const [downloading, setDownloading] = useState(false)
  const [carPageUrl, setCarPageUrl] = useState("")
  const fallbackReturnToShopHref = `/shop?highlight=${encodeURIComponent(car.id)}`
  const [returnToShopHref, setReturnToShopHref] = useState(fallbackReturnToShopHref)

  useEffect(() => {
    setCarPageUrl(window.location.href)
    try {
      setReturnToShopHref(sessionStorage.getItem(`tg-world-return-to-shop:${car.id}`) || fallbackReturnToShopHref)
    } catch {
      setReturnToShopHref(fallbackReturnToShopHref)
    }
  }, [car.id, fallbackReturnToShopHref])

  const carLabel = `${yearPrefix}${car.name}`.trim()

  const buildCarInquiryWhatsAppHref = (whatsapp: string) => {
    const pageUrl = carPageUrl
    const text = `I would like more info on ${carLabel}\n\n${pageUrl}`
    return tzWhatsAppHref(whatsapp, text)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const handleDownloadPhotos = async () => {
    if (downloading) return
    setDownloading(true)
    const allImages = (car.images && car.images.length > 0 ? car.images : [car.image]).filter(Boolean) as string[]
    const carSlug = (car.name || "car").replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "")

    try {
      // Fetch all images via proxy (avoids CORS)
      const files: { name: string; data: Uint8Array }[] = []
      for (let i = 0; i < allImages.length; i++) {
        const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(allImages[i])}`
        const res = await fetch(proxyUrl)
        if (!res.ok) continue
        const blob = await res.blob()
        const ext = blob.type.includes("png") ? "png" : blob.type.includes("webp") ? "webp" : "jpg"
        const buf = await blob.arrayBuffer()
        files.push({ name: `${carSlug}_photo_${i + 1}.${ext}`, data: new Uint8Array(buf) })
      }

      if (files.length === 0) return

      // Build a ZIP file manually (PKZIP STORED — no compression, no dependencies)
      const zipParts: Uint8Array[] = []
      const centralDir: Uint8Array[] = []
      const encoder = new TextEncoder()
      let offset = 0

      for (const file of files) {
        const nameBytes = encoder.encode(file.name)
        const crc = crc32(file.data)
        const size = file.data.length

        // Local file header
        const local = new DataView(new ArrayBuffer(30 + nameBytes.length))
        local.setUint32(0, 0x04034b50, true)  // signature
        local.setUint16(4, 20, true)           // version needed
        local.setUint16(6, 0, true)            // flags
        local.setUint16(8, 0, true)            // STORED (no compression)
        local.setUint16(10, 0, true)           // mod time
        local.setUint16(12, 0, true)           // mod date
        local.setUint32(14, crc, true)
        local.setUint32(18, size, true)
        local.setUint32(22, size, true)
        local.setUint16(26, nameBytes.length, true)
        local.setUint16(28, 0, true)
        nameBytes.forEach((b, j) => local.setUint8(30 + j, b))
        const localArr = new Uint8Array(local.buffer)
        zipParts.push(localArr)
        zipParts.push(file.data)

        // Central directory entry
        const cd = new DataView(new ArrayBuffer(46 + nameBytes.length))
        cd.setUint32(0, 0x02014b50, true)
        cd.setUint16(4, 20, true)
        cd.setUint16(6, 20, true)
        cd.setUint16(8, 0, true)
        cd.setUint16(10, 0, true)
        cd.setUint16(12, 0, true)
        cd.setUint16(14, 0, true)
        cd.setUint32(16, crc, true)
        cd.setUint32(20, size, true)
        cd.setUint32(24, size, true)
        cd.setUint16(28, nameBytes.length, true)
        cd.setUint16(30, 0, true)
        cd.setUint16(32, 0, true)
        cd.setUint16(34, 0, true)
        cd.setUint16(36, 0, true)
        cd.setUint32(38, 0, true)
        cd.setUint32(42, offset, true)
        nameBytes.forEach((b, j) => cd.setUint8(46 + j, b))
        centralDir.push(new Uint8Array(cd.buffer))

        offset += localArr.length + file.data.length
      }

      const cdSize = centralDir.reduce((s, a) => s + a.length, 0)
      const eocd = new DataView(new ArrayBuffer(22))
      eocd.setUint32(0, 0x06054b50, true)
      eocd.setUint16(4, 0, true)
      eocd.setUint16(6, 0, true)
      eocd.setUint16(8, files.length, true)
      eocd.setUint16(10, files.length, true)
      eocd.setUint32(12, cdSize, true)
      eocd.setUint32(16, offset, true)
      eocd.setUint16(20, 0, true)

      const all = [...zipParts, ...centralDir, new Uint8Array(eocd.buffer)]
      const total = all.reduce((s, a) => s + a.length, 0)
      const zip = new Uint8Array(total)
      let pos = 0
      for (const chunk of all) { zip.set(chunk, pos); pos += chunk.length }

      const blob = new Blob([zip], { type: "application/zip" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${carSlug}_photos.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 animate-fade-in-up">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <Button asChild variant="ghost" size="sm" className="h-auto rounded-full border-0 bg-transparent px-2 py-1 text-sm font-medium text-foreground shadow-none hover:bg-transparent hover:text-primary">
              <Link href={returnToShopHref}>
                <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                Back to Shop
              </Link>
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            {/* Car Title */}
            <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s", opacity: 0, animationFillMode: "forwards" }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {yearPrefix}{car.name}
                  </h1>
                </div>
                {/* Copy Link button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="shrink-0 ml-4 rounded-full gap-1.5 text-xs border-border"
                >
                  {copied
                    ? <><CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> Copied!</>
                    : <><LinkIcon className="w-3.5 h-3.5" /> Copy Link</>
                  }
                </Button>
              </div>
              <div className="flex items-start justify-between mb-2 gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {/* Location */}
                    {car.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{car.location}</span>
                      </div>
                    )}

                    {/* Third Party */}
                    {isThirdParty && (
                      <Badge className="bg-purple-600 text-white text-xs font-medium">
                        Third Party
                      </Badge>
                    )}

                    {/* Registered / Unregistered */}
                    {car.registered !== undefined && (
                      <Badge
                        className={
                          car.registered
                            ? "bg-emerald-600 text-white text-xs font-medium"
                            : "bg-background text-foreground border border-border text-xs font-medium"
                        }
                      >
                        {car.registered ? "Registered" : "Unregistered"}
                      </Badge>
                    )}

                    {/* Registration plate number */}
                    {car.registrationNumber && (
                      <Badge className="rounded-none font-mono font-bold bg-yellow-400 text-black border-2 border-black text-xs">
                        {car.registrationNumber}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Download photos button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPhotos}
                  disabled={downloading}
                  className="shrink-0 rounded-full gap-1.5 text-xs border-border mt-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  {downloading ? "Downloading…" : `Download photos${images.length > 1 ? ` (${images.length})` : ""}`}
                </Button>
              </div>
            </div>

            {/* Main Image */}
            <div className="relative bg-muted rounded-2xl overflow-hidden mb-4 animate-scale-in" style={{ aspectRatio: "16/10", animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}>
              <Image
                src={images[selectedImageIndex]}
                alt={`${yearPrefix}${car.name}`}
                fill
                className="object-cover"
                unoptimized={images[selectedImageIndex]?.startsWith('http')}
              />
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-foreground/80 backdrop-blur-sm text-white flex items-center justify-center hover:bg-foreground transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-foreground/80 backdrop-blur-sm text-white flex items-center justify-center hover:bg-foreground transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-foreground/80 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnail Images - Horizontal Scroll */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent animate-fade-in" style={{ animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards" }}>
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all shrink-0 w-32 sm:w-40 ${
                      selectedImageIndex === index
                        ? "border-primary"
                        : "border-transparent hover:border-border"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`View ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized={img?.startsWith('http')}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Overview Section */}
            {/* Book a Test Drive banner — only when the car is in stock, not coming soon, and test_drive_available is true */}
            {car.testDriveAvailable && isCarAvailableNow(car) && (
              <div className="mt-8 rounded-2xl overflow-hidden border border-border animate-fade-in-up flex flex-col sm:flex-row" style={{ animationDelay: "0.35s", opacity: 0, animationFillMode: "forwards", minHeight: "160px" }}>
                {/* Left: dark text panel */}
                <div className="flex-1 bg-black flex flex-col justify-center px-7 py-8 sm:py-6">
                  <h1 className="font-[family-name:var(--font-outfit),sans-serif] text-2xl sm:text-3xl font-extrabold leading-tight mb-2" style={{ color: "#FF6600" }}>
                    Book a test drive
                  </h1>
                  <p className="text-white/85 text-sm sm:text-base mb-5 max-w-xs">
                    Experience this vehicle firsthand. Schedule a test drive at your convenience
                  </p>
                  <Link
                    href={`/test-drive/${car.id}`}
                    className="inline-flex items-center justify-center w-fit px-6 py-2.5 rounded-full font-semibold text-sm text-white transition-all duration-200 hover:opacity-90"
                    style={{ backgroundColor: "#FF6600" }}
                  >
                    Book now
                  </Link>
                </div>
                {/* Right: photo */}
                <div className="relative w-full sm:w-64 md:w-80 shrink-0" style={{ minHeight: "180px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/test_drive.jpg"
                    alt="Test drive"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            )}

            <div className="mt-8 bg-card rounded-2xl p-6 border border-border animate-fade-in-up" style={{ animationDelay: "0.4s", opacity: 0, animationFillMode: "forwards" }}>
              <h2 className="text-xl font-bold mb-4 text-foreground">Overview</h2>
              
              <div className="grid grid-cols-2 gap-4">
                {car.engineSize && (
                  <div>
                    <p className="text-sm text-muted-foreground">Engine</p>
                    <p className="font-medium text-foreground">{car.engineSize}</p>
                  </div>
                )}
                {car.mileage && (
                  <div>
                    <p className="text-sm text-muted-foreground">Mileage</p>
                    <p className="font-medium text-foreground">{car.mileage}</p>
                  </div>
                )}
                {car.transmission && (
                  <div>
                    <p className="text-sm text-muted-foreground">Transmission</p>
                    <p className="font-medium text-foreground">{car.transmission}</p>
                  </div>
                )}
                {car.fuel && (
                  <div>
                    <p className="text-sm text-muted-foreground">Fuel</p>
                    <p className="font-medium text-foreground">{car.fuel}</p>
                  </div>
                )}
                {car.drive && (
                  <div>
                    <p className="text-sm text-muted-foreground">Drive Type</p>
                    <p className="font-medium text-foreground">{car.drive}</p>
                  </div>
                )}
                {car.color && (
                  <div>
                    <p className="text-sm text-muted-foreground">Exterior Color</p>
                    <p className="font-medium text-foreground">{car.color}</p>
                  </div>
                )}
                {car.seats && (
                  <div>
                    <p className="text-sm text-muted-foreground">Seats</p>
                    <p className="font-medium text-foreground">{car.seats}</p>
                  </div>
                )}
                {car.doors && (
                  <div>
                    <p className="text-sm text-muted-foreground">Doors</p>
                    <p className="font-medium text-foreground">{car.doors}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Features Section */}
            {car.features && car.features.length > 0 && (
              <div className="mt-6 bg-card rounded-2xl p-6 border border-border animate-fade-in-up" style={{ animationDelay: "0.5s", opacity: 0, animationFillMode: "forwards" }}>
                <h2 className="text-xl font-bold mb-4 text-foreground">Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {car.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description — Specifications + Features */}
            {car.description && (
              <div className="mt-6 bg-white rounded-2xl border border-border p-6 space-y-8 animate-fade-in-up" style={{ animationDelay: "0.6s", opacity: 0, animationFillMode: "forwards" }}>
                {(() => {
                  const desc = car.description.replace('[THIRD_PARTY] ', '')
                  const lines = desc.split('\n').filter(l => l.trim())

                  // Ordered spec rows to parse
                  const specDefs: { label: string; pattern: RegExp }[] = [
                    { label: 'Engine Size',   pattern: /Engine Size\s*:\s*(.+)/i },
                    { label: 'Fuel',          pattern: /Fuel\s*:\s*(.+)/i },
                    { label: 'Transmission',  pattern: /Transmission\s*:\s*(.+)/i },
                    { label: 'Mileage',       pattern: /Mileage\s*:\s*(.+)/i },
                    { label: 'Colour',        pattern: /Colou?r\s*:\s*(.+)/i },
                    { label: 'Seat Capacity', pattern: /Seat Capacity\s*:\s*(.+)/i },
                    { label: 'Doors',         pattern: /Doors\s*:\s*(.+)/i },
                    { label: 'Drive',         pattern: /Drive\s*:\s*(.+)/i },
                    { label: 'Body Type',     pattern: /Body Type\s*:\s*(.+)/i },
                  ]

                  const specs: { label: string; value: string }[] = []
                  const featureLines: string[] = []
                  let inFeatures = false

                  lines.forEach(line => {
                    const trimmed = line.trim()

                    // Features block — inline "Features : A | B" or "Features:" on its own line
                    if (/^Features\s*:/i.test(trimmed)) {
                      inFeatures = true
                      const afterLabel = trimmed.replace(/^Features\s*:\s*/i, '').trim()
                      if (afterLabel) featureLines.push(afterLabel)
                      return
                    }

                    if (inFeatures) {
                      // Stop when a new labelled field starts (e.g. "Location : ...")
                      if (/^[A-Za-z][\w\s]*\s*:\s*.+/i.test(trimmed) && !trimmed.includes('|')) {
                        inFeatures = false
                      } else {
                        featureLines.push(trimmed)
                        return
                      }
                    }

                    for (const def of specDefs) {
                      const m = trimmed.match(def.pattern)
                      if (m) {
                        specs.push({ label: def.label, value: m[1].trim() })
                        return
                      }
                    }
                  })

                  const features = featureLines
                    .join(' ')
                    .split('|')
                    .map(f => f.trim())
                    .filter(Boolean)

                  // Split specs into two columns
                  const half = Math.ceil(specs.length / 2)
                  const leftSpecs = specs.slice(0, half)
                  const rightSpecs = specs.slice(half)

                  return (
                    <>
                      {/* Specifications */}
                      {specs.length > 0 && (
                        <div>
                          <h2 className="text-lg font-bold text-foreground mb-3">Specifications</h2>
                          <div className="rounded-xl border border-border overflow-hidden">
                            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border bg-white">
                              {/* Left column */}
                              <div className="divide-y divide-border">
                                {leftSpecs.map((spec, i) => (
                                  <div key={i} className="flex items-center justify-between px-6 py-3.5">
                                    <span className="text-sm text-muted-foreground">{spec.label}</span>
                                    <span className="text-sm font-semibold text-foreground text-right ml-4">{spec.value}</span>
                                  </div>
                                ))}
                              </div>
                              {/* Right column */}
                              <div className="divide-y divide-border">
                                {rightSpecs.map((spec, i) => (
                                  <div key={i} className="flex items-center justify-between px-6 py-3.5">
                                    <span className="text-sm text-muted-foreground">{spec.label}</span>
                                    <span className="text-sm font-semibold text-foreground text-right ml-4">{spec.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Features */}
                      {features.length > 0 && (
                        <div>
                          <h2 className="text-lg font-bold text-foreground mb-3">Features</h2>
                          <div className="rounded-xl border border-border bg-white px-6 py-5">
                            <div className="flex flex-wrap gap-2">
                              {features.map((feat, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-gray-50 text-sm text-foreground"
                                >
                                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                                  {feat}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Fallback: raw text if nothing parsed */}
                      {specs.length === 0 && features.length === 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{desc}</p>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            )}
          </div>

          {/* Right Column - Pricing & Contact */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {/* Notes Card — separate, above the pricing sticky */}
            <div className="bg-card rounded-2xl p-6 border border-border animate-slide-in-right" style={{ animationDelay: "0.25s", opacity: 0, animationFillMode: "forwards" }}>
              <h3 className="font-semibold text-foreground mb-2">Notes</h3>
              <p className="font-[family-name:var(--font-carter-one),system-ui] font-light text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {car.notes?.trim() ? car.notes.trim() : "null"}
              </p>
            </div>

            {/* Pricing Card */}
            <div className="bg-card rounded-2xl p-6 border border-border sticky top-24 animate-slide-in-right" style={{ animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards" }}>
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-1">Price</p>
                <CarPrice car={car} size="detail" />
              </div>

              {activePromotions.length > 0 && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50/60 p-4">
                  <h3 className="font-semibold text-foreground mb-2">Active Promotions</h3>
                  <ul className="space-y-2">
                    {activePromotions.map((promo) => (
                      <li key={promo.promoID} className="text-sm">
                        <p className="font-medium text-foreground">{promo.promo_name}</p>
                        <p className="text-red-600 font-semibold">{promo.price_reduction_label} OFF</p>
                        <p className="text-muted-foreground text-xs">
                          {formatPromoDateRange(promo.start_date, promo.end_date)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button 
                onClick={() => window.location.href = `/checkout/${car.id}`}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-xl text-base font-medium mb-4"
              >
                Proceed to Buy
              </Button>

              {/* Financing Details */}
              <div className="space-y-3 pt-4 border-t border-border">
                <h3 className="font-semibold text-foreground mb-3">Financing</h3>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sales Price*</span>
                  <span className="font-medium text-foreground text-right">
                    {displayPrice.original && (
                      <span className="block text-xs text-muted-foreground line-through">{displayPrice.original}</span>
                    )}
                    <span className={displayPrice.original ? "text-red-600" : ""}>{displayPrice.current}</span>
                  </span>
                </div>
                
                {car.mileage && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mileage</span>
                    <span className="font-medium text-foreground">{car.mileage}</span>
                  </div>
                )}
                
                {car.transmission && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Transmission</span>
                    <span className="font-medium text-foreground">{car.transmission}</span>
                  </div>
                )}

                {car.fuel && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fuel</span>
                    <span className="font-medium text-foreground">{car.fuel}</span>
                  </div>
                )}
              </div>

              {/* Contact Dealer */}
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="font-semibold text-foreground mb-4">Contact Dealer</h3>
                <div className="divide-y divide-border">
                  {DEALER_CONTACTS.map((contact) => (
                    <div key={contact.name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                        <Image
                          src={contact.image}
                          alt={contact.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <p className="flex-1 min-w-0 text-sm font-bold text-foreground leading-tight">
                        {contact.name}
                      </p>
                      <div className="flex shrink-0 items-center gap-2">
                        <a
                          href={tzPhoneHref(contact.phone)}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2D9CDB] text-white shadow-md transition-opacity hover:opacity-90"
                          aria-label={`Call ${contact.name}`}
                        >
                          <Phone className="h-5 w-5" />
                        </a>
                        <a
                          href={buildCarInquiryWhatsAppHref(contact.whatsapp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md transition-opacity hover:opacity-90"
                          aria-label={`WhatsApp ${contact.name} about ${carLabel}`}
                        >
                          <WhatsAppIcon className="h-5 w-5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* You may also like */}
        {relatedCars.length > 0 && (
          <div className="mt-14">
            <h2 className="font-[family-name:var(--font-outfit),sans-serif] text-2xl font-bold text-foreground mb-6">
              You may also like
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scrollbar-hide">
              {relatedCars.map((related, i) => (
                <div key={related.id} className="flex-none w-56 sm:w-64">
                  <CarCard car={related} compact delay={i * 80} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
