"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Calendar, CheckCircle, User } from "lucide-react"
import type { Car } from "@/lib/cars-data"

interface TestDriveContentProps {
  car: Car
}

interface TestDriveFormData {
  customerName: string
  phone: string
  email: string
  bookedAt: string
}

const EMPTY_FORM: TestDriveFormData = {
  customerName: "",
  phone: "",
  email: "",
  bookedAt: "",
}

async function carPhotoFile(imageUrl: string, carName: string): Promise<File | null> {
  try {
    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`
    const res = await fetch(proxyUrl)
    if (!res.ok) return null
    const blob = await res.blob()
    const ext = blob.type.includes("png")
      ? "png"
      : blob.type.includes("webp")
        ? "webp"
        : "jpg"
    const slug = carName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "") || "car"
    return new File([blob], `${slug}_photo.${ext}`, { type: blob.type || "image/jpeg" })
  } catch {
    return null
  }
}

export function TestDriveContent({ car }: TestDriveContentProps) {
  const [formData, setFormData] = useState<TestDriveFormData>({ ...EMPTY_FORM })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const yearLabel = car.year ? String(car.year) : ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    const missing: string[] = []
    if (!formData.customerName.trim()) missing.push("Full name")
    if (!formData.phone.trim()) missing.push("Phone")
    if (!formData.email.trim()) missing.push("Email")
    if (!formData.bookedAt.trim()) missing.push("Preferred date")
    if (missing.length) {
      setSubmitError(`Please fill in: ${missing.join(", ")}`)
      return
    }

    setSubmitting(true)
    try {
      const form = new FormData()
      form.append("car_id", car.id)
      form.append("car_name", car.name)
      if (yearLabel) form.append("year", yearLabel)
      form.append("customer_name", formData.customerName.trim())
      form.append("phone", formData.phone.trim())
      form.append("email", formData.email.trim())
      form.append("booked_at", formData.bookedAt)

      const photoFile = await carPhotoFile(car.image, car.name)
      if (photoFile) {
        form.append("photo", photoFile, photoFile.name)
      }

      const res = await fetch("/api/test-drives", {
        method: "POST",
        body: form,
      })

      if (!res.ok) {
        let msg = `Server error (${res.status})`
        try {
          const json = await res.json()
          if (typeof json?.message === "string") msg = json.message
        } catch {
          /* ignore */
        }
        throw new Error(msg)
      }

      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="pt-20 pb-12">
        <div className="max-w-lg mx-auto px-4 sm:px-6 text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Test drive booked!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you, {formData.customerName.trim()}. Our team will contact you shortly to confirm your test drive for the{" "}
            {yearLabel ? `${yearLabel} ` : ""}
            {car.name}.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline">
              <Link href={`/car/${car.id}`}>Back to car details</Link>
            </Button>
            <Button asChild>
              <Link href="/shop">Browse more vehicles</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href={`/car/${car.id}`}
          className="mb-6 flex items-center gap-2 text-muted-foreground transition-colors animate-fade-in-up hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span>Back to car details</span>
        </Link>

        <h1
          className="font-[family-name:var(--font-outfit),sans-serif] text-3xl font-bold text-foreground mb-2 animate-fade-in-up"
          style={{ animationDelay: "0.1s", opacity: 0, animationFillMode: "forwards" }}
        >
          Book a test drive
        </h1>
        <p
          className="text-muted-foreground mb-8 animate-fade-in-up"
          style={{ animationDelay: "0.15s", opacity: 0, animationFillMode: "forwards" }}
        >
          Fill in your details and we will get in touch to schedule your visit.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-card rounded-2xl p-6 border border-border animate-fade-in-up space-y-6"
              style={{ animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}
            >
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <User className="w-5 h-5" />
                Your details
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    placeholder="JOHN DOE"
                    autoCapitalize="characters"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerName: e.target.value.toLocaleUpperCase(),
                      })
                    }
                    className="h-11"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+255 123 456 789"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-11"
                      required
                    />
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
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bookedAt" className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Preferred date *
                  </Label>
                  <Input
                    id="bookedAt"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.bookedAt}
                    onChange={(e) => setFormData({ ...formData, bookedAt: e.target.value })}
                    className="h-11"
                    required
                  />
                </div>
              </div>

              {submitError && (
                <p className="text-sm text-destructive" role="alert">
                  {submitError}
                </p>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl text-base font-semibold"
                style={{ backgroundColor: "#FF6600" }}
              >
                {submitting ? "Submitting…" : "Confirm test drive"}
              </Button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div
              className="bg-card rounded-2xl p-6 border border-border sticky top-24 animate-slide-in-right"
              style={{ animationDelay: "0.25s", opacity: 0, animationFillMode: "forwards" }}
            >
              <h2 className="text-xl font-bold mb-6 text-foreground">Vehicle</h2>

              <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-muted">
                <Image
                  src={car.image}
                  alt={`${yearLabel} ${car.name}`.trim()}
                  fill
                  className="object-cover"
                  unoptimized={car.image?.startsWith("http")}
                />
              </div>

              <h3 className="font-semibold text-lg text-foreground">
                {yearLabel ? `${yearLabel} ` : ""}
                {car.name}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
