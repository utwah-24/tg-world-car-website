"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Phone, Mail, MapPin, Send, ExternalLink } from "lucide-react"
import { useState } from "react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const GOOGLE_MAPS_LOCATION_URL = "https://maps.app.goo.gl/MJ1xDiQjc1XpLbR29"

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 })
  const { ref: formRef, isVisible: formVisible } = useScrollAnimation({ threshold: 0.1 })
  const { ref: infoRef, isVisible: infoVisible } = useScrollAnimation({ threshold: 0.1 })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    alert("Thank you for your message! We will get back to you soon.")
    setFormData({ name: "", email: "", phone: "", message: "" })
  }

  return (
    <section id="contact" className="py-12 lg:py-20 bg-muted scroll-mt-20 lg:scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`text-left mb-10 lg:mb-14 transition-all duration-700 ease-out ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            Get in Touch
          </h2>
          <p className="mt-2 text-base text-muted-foreground max-w-2xl">
            Ready to find your dream car? Contact us today and let our team help you get behind the wheel.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Form */}
          <div
            ref={formRef}
            className={`bg-card rounded-2xl p-6 sm:p-8 shadow-sm border border-border transition-all duration-700 ease-out ${
              formVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <h3 className="text-xl font-bold mb-6 text-foreground">Send us a message</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+255 123 456 789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="I'm interested in..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" size="lg" className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                Send Message
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div
            ref={infoRef}
            className={`flex flex-col justify-center transition-all duration-700 ease-out ${
              infoVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="space-y-5">
              {/* Contact Cards */}
              <div className="flex items-start gap-4 p-5 bg-card rounded-2xl border border-border">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Call Us</h4>
                  <p className="text-muted-foreground text-sm mt-1">
                    <a href="tel:+255754441146" className="hover:text-foreground underline-offset-4 hover:underline">
                      0754 441 146
                    </a>
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <a href="tel:+255748364714" className="hover:text-foreground underline-offset-4 hover:underline">
                      0748364714
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-card rounded-2xl border border-border">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Email Us</h4>
                  <p className="text-muted-foreground text-sm mt-1">
                    <a href="mailto:info@tgworldtz.com" className="hover:text-foreground underline-offset-4 hover:underline">
                      info@tgworldtz.com
                    </a>
                  </p>
                </div>
              </div>

              <a
                href={GOOGLE_MAPS_LOCATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Sinza, Dar es Salaam in Google Maps"
                className="group flex flex-col sm:flex-row sm:items-start gap-4 p-5 bg-card rounded-2xl border border-border transition-all duration-200 hover:border-primary/40 hover:bg-primary/[0.03] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 transition-colors group-hover:bg-primary/15">
                  <MapPin className="w-5 h-5 text-primary" aria-hidden />
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <h4 className="font-semibold text-foreground">Visit Us</h4>
                    <p className="text-muted-foreground text-sm mt-1">Sinza</p>
                    <p className="text-muted-foreground text-sm">Dar es Salaam, Tanzania</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                      Open in Google Maps
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                    </span>
                    <span className="text-xs text-muted-foreground">Opens in a new tab</span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
