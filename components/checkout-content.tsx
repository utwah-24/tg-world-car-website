"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, MapPin, User, CheckCircle } from "lucide-react"
import type { Car } from "@/lib/cars-data"
import {
  checkoutDraftFromStorage,
  checkoutDraftStorageKey,
  EMPTY_CHECKOUT_FORM,
  type CheckoutFormData,
} from "@/lib/checkout-draft"
import {
  PROFORMA_STORAGE_KEY,
  type ProformaInvoicePayload,
} from "@/lib/proforma-types"
import { extractChassisFromText, generateInvoiceNo } from "@/lib/proforma-utils"

interface CheckoutContentProps {
  car: Car
}

export function CheckoutContent({ car }: CheckoutContentProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<CheckoutFormData>(() => ({
    ...EMPTY_CHECKOUT_FORM,
  }))
  const [draftHydrated, setDraftHydrated] = useState(false)
  const skipNextPersist = useRef(false)

  useEffect(() => {
    skipNextPersist.current = true
    const key = checkoutDraftStorageKey(car.id)
    try {
      setFormData(checkoutDraftFromStorage(sessionStorage.getItem(key)))
    } catch {
      setFormData({ ...EMPTY_CHECKOUT_FORM })
    }
    setDraftHydrated(true)
  }, [car.id])

  useEffect(() => {
    if (!draftHydrated) return
    if (skipNextPersist.current) {
      skipNextPersist.current = false
      return
    }
    const key = checkoutDraftStorageKey(car.id)
    try {
      sessionStorage.setItem(key, JSON.stringify(formData))
    } catch {
      /* private mode / quota */
    }
  }, [formData, car.id, draftHydrated])

  const handleRequestProforma = () => {
    if (!formData.agreeToTerms) {
      alert("Please agree to the terms and conditions")
      return
    }
    const missing: string[] = []
    if (!formData.fullName.trim()) missing.push("Full name")
    if (!formData.phone.trim()) missing.push("Phone")
    if (!formData.email.trim()) missing.push("Email")
    if (missing.length) {
      alert(`Please fill in: ${missing.join(", ")}`)
      return
    }

    const additionalTrimmed = formData.additionalInfo.trim()
    const payload: ProformaInvoicePayload = {
      buyer: {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      },
      delivery: {
        address: formData.address.trim(),
        city: formData.city.trim(),
        region: formData.region.trim(),
        postalCode: formData.postalCode.trim(),
      },
      ...(additionalTrimmed ? { additionalInfo: additionalTrimmed } : {}),
      car: {
        id: car.id,
        name: car.name,
        year: car.year,
        price: car.price,
        image: car.image,
        color: car.color,
        description: car.description,
      },
      chassis: extractChassisFromText(car.description),
      invoiceNo: generateInvoiceNo(),
      invoiceDate: new Date().toISOString(),
    }

    try {
      sessionStorage.setItem(PROFORMA_STORAGE_KEY, JSON.stringify(payload))
    } catch {
      alert("Could not save invoice data. Please try again or disable private mode.")
      return
    }
    router.push("/proforma-invoice")
  }

  return (
    <div className="pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to this vehicle’s detail page (history.back() is unreliable after proforma / deep links) */}
        <Link
          href={`/car/${car.id}`}
          className="mb-6 flex items-center gap-2 text-muted-foreground transition-colors animate-fade-in-up hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span>Back to car details</span>
        </Link>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-foreground mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s", opacity: 0, animationFillMode: "forwards" }}>Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Buyer Information */}
            <div className="bg-card rounded-2xl p-6 border border-border animate-fade-in-up" style={{ animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}>
              <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
                <User className="w-5 h-5" />
                Buyer Information
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="JOHN DOE"
                    autoCapitalize="characters"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fullName: e.target.value.toLocaleUpperCase(),
                      })
                    }
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+255 123 456 789"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-11"
                  />
                </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address in Tanzania */}
            <div className="bg-card rounded-2xl p-6 border border-border animate-fade-in-up" style={{ animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards" }}>
              <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Delivery Address (Tanzania)
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Optional — add if you want delivery details on the proforma.
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Main Street"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Dar es Salaam"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      placeholder="Kinondoni"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      placeholder="14111"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-card rounded-2xl p-6 border border-border animate-fade-in-up" style={{ animationDelay: "0.5s", opacity: 0, animationFillMode: "forwards" }}>
              <h2 className="text-xl font-bold mb-4 text-foreground">Additional Information</h2>
              <p className="mb-4 text-sm text-muted-foreground">Optional.</p>
              
              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Special Requests or Questions</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Let us know if you have any special requests or questions..."
                  rows={4}
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                />
              </div>
            </div>

            {/* Terms & Submit */}
            <div className="bg-card rounded-2xl p-6 border border-border animate-fade-in-up" style={{ animationDelay: "0.6s", opacity: 0, animationFillMode: "forwards" }}>
              <div className="flex items-start gap-3 mb-6">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                  I agree to the terms and conditions and privacy policy. I understand that TG World will contact me regarding this purchase inquiry.
                </Label>
              </div>

              <Button 
                type="button"
                onClick={handleRequestProforma}
                disabled={!formData.agreeToTerms}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 rounded-xl text-lg font-semibold"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Request Proforma Invoice
              </Button>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-6 border border-border sticky top-24 animate-slide-in-right" style={{ animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards" }}>
              <h2 className="text-xl font-bold mb-6 text-foreground">Order Summary</h2>
              
              {/* Car Image */}
              <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-muted">
                <Image
                  src={car.image}
                  alt={`${car.year} ${car.name}`}
                  fill
                  className="object-cover"
                  unoptimized={car.image?.startsWith('http')}
                />
              </div>

              {/* Car Details */}
              <h3 className="font-semibold text-lg text-foreground mb-1">
                {car.year} {car.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {car.mileage} • {car.fuel} • {car.transmission}
              </p>

              {/* Price Breakdown */}
              <div className="space-y-3 py-4 border-y border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Vehicle Price</span>
                  <span className="font-medium text-foreground">{car.price}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Registration Fee</span>
                  <span className="font-medium text-foreground">Included</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Documentation</span>
                  <span className="font-medium text-foreground">Included</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between mt-4">
                <span className="text-lg font-bold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">{car.price}</span>
              </div>

              {/* Delivery Info */}
              <div className="mt-6 p-4 bg-muted rounded-xl">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-foreground">Pickup Location</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      TG World Showroom<br />
                      Sinza, Dar es Salaam<br />
                      Tanzania
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Support */}
              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground mb-2">Need help?</p>
                <a 
                  href="/#contact" 
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Contact our sales team
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
