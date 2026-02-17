"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, MapPin, Star, Shield, Fuel, Gauge, Calendar, Car as CarIcon, DollarSign, Cog, Palette, Settings, Users, Check } from "lucide-react"
import type { Car } from "@/lib/cars-data"

interface CarDetailsContentProps {
  car: Car
}

export function CarDetailsContent({ car }: CarDetailsContentProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const images = car.images && car.images.length > 0 ? car.images : [car.image]

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
        <div className="mb-6 text-sm text-muted-foreground animate-fade-in-up">
          <a href="/" className="hover:text-primary">Home</a>
          <span className="mx-2">/</span>
          <span className="text-foreground">{car.year} {car.name}</span>
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
                    {car.year} {car.name}
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Dar es Salaam</span>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Image */}
            <div className="relative bg-muted rounded-2xl overflow-hidden mb-4 animate-scale-in" style={{ aspectRatio: "16/10", animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}>
              <Image
                src={images[selectedImageIndex]}
                alt={`${car.year} ${car.name}`}
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

            {/* Description - Redesigned */}
            {car.description && (
              <div className="mt-6 bg-card rounded-2xl p-6 border border-border animate-fade-in-up" style={{ animationDelay: "0.6s", opacity: 0, animationFillMode: "forwards" }}>
                <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  Vehicle Details
                </h2>
                
                {(() => {
                  const desc = car.description.replace('[THIRD_PARTY] ', '')
                  const lines = desc.split('\n').filter(line => line.trim())
                  
                  // Extract different sections
                  const specs: { label: string, value: string, IconComponent: any }[] = []
                  const highlights: string[] = []
                  
                  lines.forEach(line => {
                    const priceMatch = line.match(/Price\s*:\s*(.+)/i)
                    const engineMatch = line.match(/Engine Size\s*:\s*(.+)/i)
                    const fuelMatch = line.match(/Fuel\s*:\s*(.+)/i)
                    const transMatch = line.match(/Transmission\s*:\s*(.+)/i)
                    const mileageMatch = line.match(/Mileage\s*:\s*(.+)/i)
                    const driveMatch = line.match(/Drive\s*:\s*(.+)/i)
                    const seatsMatch = line.match(/Seat Capacity\s*:\s*(.+)/i)
                    const colorMatch = line.match(/Colou?r\s*:\s*(.+)/i)
                    const featuresMatch = line.match(/Features\s*:\s*(.+)/i)
                    
                    if (priceMatch) specs.push({ label: 'Price', value: priceMatch[1].trim(), IconComponent: DollarSign })
                    else if (engineMatch) specs.push({ label: 'Engine', value: engineMatch[1].trim(), IconComponent: Cog })
                    else if (fuelMatch) specs.push({ label: 'Fuel Type', value: fuelMatch[1].trim(), IconComponent: Fuel })
                    else if (transMatch) specs.push({ label: 'Transmission', value: transMatch[1].trim(), IconComponent: Settings })
                    else if (mileageMatch) specs.push({ label: 'Mileage', value: mileageMatch[1].trim(), IconComponent: Gauge })
                    else if (driveMatch) specs.push({ label: 'Drive Type', value: driveMatch[1].trim(), IconComponent: CarIcon })
                    else if (seatsMatch) specs.push({ label: 'Seats', value: seatsMatch[1].trim(), IconComponent: Users })
                    else if (colorMatch) specs.push({ label: 'Color', value: colorMatch[1].trim(), IconComponent: Palette })
                    else if (featuresMatch) highlights.push(featuresMatch[1].trim())
                    else if (line.trim() && !line.includes(':') && line.length > 10) {
                      highlights.push(line.trim())
                    }
                  })
                  
                  return (
                    <div className="space-y-6">
                      {/* Specifications Grid */}
                      {specs.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Specifications</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {specs.map((spec, index) => {
                              const Icon = spec.IconComponent
                              return (
                                <div 
                                  key={index} 
                                  className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                                >
                                  <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Icon className="w-5 h-5 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground font-medium">{spec.label}</p>
                                    <p className="text-sm font-semibold text-foreground mt-0.5 truncate">{spec.value}</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Highlights */}
                      {highlights.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Highlights</h3>
                          <div className="space-y-2">
                            {highlights.map((highlight, index) => (
                              <div 
                                key={index}
                                className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border-l-4 border-primary"
                              >
                                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <p className="text-sm text-foreground leading-relaxed">{highlight}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Full Description Fallback */}
                      {specs.length === 0 && highlights.length === 0 && (
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                          {desc}
                        </p>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}
          </div>

          {/* Right Column - Pricing & Contact */}
          <div className="lg:col-span-1">
            {/* Pricing Card */}
            <div className="bg-card rounded-2xl p-6 border border-border sticky top-24 animate-slide-in-right" style={{ animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards" }}>
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-1">Price</p>
                <div className="text-3xl font-bold text-foreground">{car.price}</div>
              </div>

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
                  <span className="font-medium text-foreground">{car.price}</span>
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
                <h3 className="font-semibold text-foreground mb-2">TG World</h3>
                <p className="text-sm text-muted-foreground mb-3">Sinza, Dar es Salaam</p>
                <Button 
                  variant="outline" 
                  className="w-full rounded-xl h-11 border-border text-foreground hover:bg-muted"
                  onClick={() => window.location.href = '/#contact'}
                >
                  Contact Dealer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
