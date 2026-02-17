"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, MapPin, User, CheckCircle, FileText, FileCheck } from "lucide-react"
import type { Car } from "@/lib/cars-data"

interface CheckoutContentProps {
  car: Car
}

export function CheckoutContent({ car }: CheckoutContentProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "Dar es Salaam",
    region: "",
    postalCode: "",
    additionalInfo: "",
    agreeToTerms: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.agreeToTerms) {
      alert("Please agree to the terms and conditions")
      return
    }
    // Handle checkout submission
    alert("Thank you for your purchase inquiry! We will contact you shortly.")
  }

  return (
    <div className="pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors animate-fade-in-up"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to car details</span>
        </button>

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
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
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
                      required
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
                    required
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
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    placeholder="123 Main Street"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="Dar es Salaam"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region *</Label>
                    <Input
                      id="region"
                      placeholder="Kinondoni"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      required
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

            {/* Request Documents */}
            <div className="bg-card rounded-2xl p-6 border border-border animate-fade-in-up" style={{ animationDelay: "0.4s", opacity: 0, animationFillMode: "forwards" }}>
              <h2 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Request Documents
              </h2>
              
              <p className="text-sm text-muted-foreground mb-6">Get detailed pricing and documentation for this vehicle</p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 rounded-xl font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                  onClick={() => alert('Proforma invoice request will be sent. Our team will contact you shortly.')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Request Proforma Invoice
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 rounded-xl font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                  onClick={() => alert('Quotation request will be sent. Our team will contact you shortly.')}
                >
                  <FileCheck className="w-4 h-4 mr-2" />
                  Request Quotation
                </Button>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-card rounded-2xl p-6 border border-border animate-fade-in-up" style={{ animationDelay: "0.5s", opacity: 0, animationFillMode: "forwards" }}>
              <h2 className="text-xl font-bold mb-4 text-foreground">Additional Information</h2>
              
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
                onClick={handleSubmit}
                disabled={!formData.agreeToTerms}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 rounded-xl text-lg font-semibold"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Submit Purchase Inquiry
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
