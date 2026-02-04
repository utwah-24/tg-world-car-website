"use client"

import { Button } from "@/components/ui/button"
import { GitCompare, FileText, Calculator, Shield } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const features = [
  {
    icon: GitCompare,
    title: "Compare Cars",
    description: "See how your favorite models stack up side by side by features, performance, and price.",
    action: "Compare Now",
    primary: true,
  },
  {
    icon: FileText,
    title: "Read Reviews",
    description: "Dive into in-depth car reviews written by automotive experts to learn what makes each model shine.",
    action: "Read Reviews",
    primary: false,
  },
  {
    icon: Calculator,
    title: "Calculate Payments",
    description: "Estimate your monthly payments with our simple calculator. Adjust loan, term, and interest to fit your budget.",
    action: "Try Calculator",
    primary: false,
  },
  {
    icon: Shield,
    title: "Verified Dealers",
    description: "Connect with verified dealers offering the best selection and deals on quality vehicles.",
    action: "Find Dealers",
    primary: false,
  },
]

export function FeaturesSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 })
  
  return (
    <section id="features" className="py-12 lg:py-20 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`text-center mb-10 lg:mb-14 transition-all duration-700 ease-out ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            Research & Compare Cars
          </h2>
          <p className="mt-2 text-base text-muted-foreground max-w-2xl mx-auto">
            Make informed decisions with our comprehensive tools, side-by-side comparisons, and helpful content.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <FeatureCard key={feature.title} feature={feature} Icon={Icon} delay={index * 100} />
            )
          })}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ feature, Icon, delay }: { feature: typeof features[0], Icon: any, delay: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })
  
  return (
    <div
      ref={ref}
      className={`bg-background rounded-2xl p-6 text-center border border-border hover:shadow-lg transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
        {feature.description}
      </p>
      <Button 
        variant={feature.primary ? "default" : "ghost"}
        className={`rounded-full h-9 px-5 text-sm ${
          feature.primary 
            ? "bg-primary text-primary-foreground hover:bg-primary/90" 
            : "text-foreground hover:text-primary hover:bg-transparent"
        }`}
      >
        {feature.action}
      </Button>
    </div>
  )
}
