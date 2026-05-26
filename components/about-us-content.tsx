"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import CountUp from "@/components/count-up"
import { aboutStats, teamMembers, type TeamMember } from "@/lib/about-data"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"

export function AboutUsContent() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <TeamSection />
    </>
  )
}

function HeroSection() {
  const { ref: copyRef, isVisible: copyVisible } = useScrollAnimation({ threshold: 0.15 })
  const { ref: imgRef, isVisible: imgVisible } = useScrollAnimation({ threshold: 0.15 })

  return (
    <section className="pt-8 pb-16 lg:pt-12 lg:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left — text */}
          <div
            ref={copyRef}
            className={cn(
              "space-y-6 lg:space-y-8 transition-all duration-700 ease-out",
              copyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">About Us</p>
            <h1 className="font-[family-name:var(--font-outfit),sans-serif] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
              Driven by trust, <span className="text-primary">focused on you.</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              At TG World, we bring you quality vehicles, unbeatable prices, and a car buying
              experience you can trust. From Japan to Tanzania, we handle everything with passion
              and professionalism.
            </p>

            <div
              className="grid sm:grid-cols-2 gap-6 pt-2 transition-all duration-700 ease-out"
              style={{ transitionDelay: "150ms" }}
            >
              <FeaturePoint
                imageSrc="/trusted.png"
                imageAlt="Trusted dealer"
                title="Trusted Dealer"
                description="Years of experience you can rely on."
              />
              <FeaturePoint
                imageSrc="/quality.png"
                imageAlt="Quality cars"
                title="Quality Cars"
                description="Carefully sourced and thoroughly inspected."
              />
            </div>
          </div>

          {/* Right — image */}
          <div
            ref={imgRef}
            className={cn(
              "relative aspect-[4/3] sm:aspect-[5/4] lg:aspect-auto lg:min-h-[420px] rounded-2xl lg:rounded-3xl overflow-hidden bg-muted border border-border transition-all duration-700 ease-out",
              imgVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12",
            )}
            style={{ transitionDelay: "100ms" }}
          >
            <Image
              src="/images/about_us.jpg"
              alt="TG World International showroom"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturePoint({
  imageSrc,
  imageAlt,
  title,
  description,
}: {
  imageSrc: string
  imageAlt: string
  title: string
  description: string
}) {
  return (
    <div className="flex gap-3">
      <div className="relative shrink-0 w-11 h-11">
        <Image src={imageSrc} alt={imageAlt} fill className="object-contain" sizes="44px" />
      </div>
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  )
}

function StatsBar() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 })

  return (
    <section className="relative z-10 -mt-4 lg:-mt-10 pb-16 lg:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={cn(
            "rounded-2xl bg-card border border-border shadow-lg shadow-black/5 px-4 py-8 sm:px-8 lg:px-10 transition-all duration-700 ease-out",
            isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-[0.98]",
          )}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x divide-border">
            {aboutStats.map((stat, index) => (
              <div
                key={stat.label}
                className={cn(
                  "flex flex-col items-center text-center px-2 lg:px-6 transition-all duration-700 ease-out",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
                )}
                style={{ transitionDelay: `${150 + index * 100}ms` }}
              >
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mb-4">
                  <Image
                    src={stat.illustration}
                    alt={stat.illustrationAlt}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 96px, 128px"
                  />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  {stat.type === "count" ? (
                    <>
                      <CountUp
                        from={0}
                        to={stat.to}
                        separator=","
                        duration={1.5}
                        className="tabular-nums"
                      />
                      {stat.suffix}
                    </>
                  ) : (
                    stat.value
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function TeamSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 })

  return (
    <section id="team" className="pb-16 lg:pb-24 scroll-mt-24 lg:scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={headerRef}
          className={cn(
            "text-center max-w-2xl mx-auto mb-10 lg:mb-14 transition-all duration-700 ease-out",
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
            The people behind TG World
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Meet Our Team
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">
            A dedicated team working together to deliver the best car buying experience in Tanzania.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {teamMembers.map((member, index) => (
            <TeamCard key={member.id} member={member} index={index} />
          ))}
        </div>

        <div className="flex justify-center mt-10 lg:mt-12">
          <Button
            asChild
            variant="outline"
            className="rounded-full h-11 px-8 border-primary/40 text-primary hover:bg-primary/5 hover:text-primary font-semibold"
          >
            <Link href="/shop">
              View All Cars
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

const FOUNDER_ROLE = "Founder & CEO"
const LEADER_BORDER = "#FF6600"

function TeamCard({ member, index }: { member: TeamMember; index: number }) {
  const isFounder = member.role === FOUNDER_ROLE
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })

  return (
    <article
      ref={ref}
      className={cn(
        "flex flex-col rounded-xl bg-card overflow-hidden h-full w-full max-w-[11.5rem] mx-auto xl:max-w-none transition-all duration-700 ease-out",
        isFounder
          ? "border-2 shadow-md shadow-[#FF6600]/20"
          : "border border-border shadow-sm",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
      )}
      style={{
        ...(isFounder ? { borderColor: LEADER_BORDER } : {}),
        transitionDelay: `${index * 80}ms`,
      }}
    >
      <div
        className={cn(
          "relative aspect-[3/4] w-full flex items-end justify-center overflow-hidden",
          !member.imageSrc && member.placeholderClass,
        )}
      >
        {member.imageSrc ? (
          <Image
            src={member.imageSrc}
            alt={member.name}
            fill
            className="object-cover object-top"
            sizes="(max-width: 1280px) 50vw, 16vw"
          />
        ) : (
          <User className="w-14 h-14 text-foreground/15 mb-4" strokeWidth={1.25} />
        )}
      </div>

      <div className="flex flex-col flex-1 p-3 text-center">
        <h3 className="font-bold text-sm text-foreground leading-tight">{member.name}</h3>
        <span
          className={cn(
            "inline-block self-center mt-1.5 text-[10px] leading-snug font-semibold rounded-full px-2 py-0.5",
            isFounder ? "text-white" : "text-primary bg-primary/10",
          )}
          style={isFounder ? { backgroundColor: LEADER_BORDER } : undefined}
        >
          {member.role}
        </span>
        <p className="mt-2 text-[11px] text-muted-foreground leading-snug flex-1 pb-1">
          {member.bio}
        </p>
      </div>
    </article>
  )
}
