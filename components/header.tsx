"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, ChevronDown } from "lucide-react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { candidateCarTypeIconPaths } from "@/lib/car-type"
import { cn } from "@/lib/utils"

/** Header logo once the nav turns white on scroll (`Logo tg2.png`). */
const HEADER_LOGO_MARKETING = "/logos/Logo%20tg2.png"

interface HeaderProps {
  logoLight?: string
  logoDark?: string
  stockCompanies?: StockCompany[]
  stockCounts?: Record<string, number>
  totalStockCount?: number
}

interface StockCompany {
  label: string
  logoUrl: string
  href: string
  count: number
}

const stockFilterColumns = [
  {
    title: "Search by type",
    items: [
      { label: "SUV", href: "/shop?stock=list&category=suv", icon: "suv" },
      { label: "Crossover SUV", href: "/shop?stock=list&category=crossover_suv", icon: "crossover_suv" },
      { label: "Pickup", href: "/shop?stock=list&category=pickup", icon: "pickup" },
      { label: "Sedan", href: "/shop?stock=list&category=sedan", icon: "sedan" },
      { label: "Van", href: "/shop?stock=list&category=van", icon: "van" },
      { label: "Truck", href: "/shop?stock=list&category=truck", icon: "truck" },
    ],
  },
  {
    title: "Car price",
    items: [
      { label: "Under 20M Tshs", href: "/shop?stock=list&price=price-under-20" },
      { label: "20M - 40M Tshs", href: "/shop?stock=list&price=price-20-40" },
      { label: "40M - 60M Tshs", href: "/shop?stock=list&price=price-40-60" },
      { label: "60M - 80M Tshs", href: "/shop?stock=list&price=price-60-80" },
      { label: "80M - 100M Tshs", href: "/shop?stock=list&price=price-80-100" },
      { label: "100M - 150M Tshs", href: "/shop?stock=list&price=price-100-150" },
      { label: "180M+", href: "/shop?stock=list&price=price-180-plus" },
    ],
  },
  {
    title: "More filters",
    items: [
      { label: "Latest cars", href: "/shop?stock=list&latest=1" },
      { label: "In Dar es Salaam", href: "/shop?stock=list&in_dar=1" },
      { label: "New", href: "/shop?stock=list&condition=new" },
      { label: "Second Hand", href: "/shop?stock=list&condition=second_hand" },
      { label: "Third Party", href: "/shop?stock=list&condition=third_party" },
      { label: "Registered", href: "/shop?stock=list&registration=registered" },
      { label: "Unregistered", href: "/shop?stock=list&registration=unregistered" },
      { label: "Over 50,000 km", href: "/shop?stock=list&mileage=mileage-over-50k" },
    ],
  },
]

function StockTypeIcon({ canon, label }: { canon: string; label: string }) {
  const paths = useMemo(() => candidateCarTypeIconPaths(canon, label), [canon, label])
  const [srcIndex, setSrcIndex] = useState(0)

  useEffect(() => {
    setSrcIndex(0)
  }, [paths])

  if (srcIndex >= paths.length) return null

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={paths[srcIndex]}
      alt=""
      width={24}
      height={24}
      className="h-full w-full object-contain p-0.5"
      onError={() => setSrcIndex((i) => i + 1)}
    />
  )
}

export function Header({
  logoLight = "/logos/Logo%20tg1.png",
  logoDark: _logoDark = "/logos/Logo%20tg1.png",
  stockCompanies = [],
  stockCounts = {},
  totalStockCount,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [stockMenuOpen, setStockMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const normalizedPath = pathname.replace(/\/$/, "") || "/"
  const isHome = normalizedPath === "/"
  const isContentPage = normalizedPath === "/content"
  const isAboutPage = normalizedPath === "/about"
  const isShopPage = normalizedPath === "/shop"
  const headerLogoSrc = isContentPage
    ? (scrolled ? HEADER_LOGO_MARKETING : logoLight)
    : isHome
    ? (scrolled ? HEADER_LOGO_MARKETING : logoLight)
    : HEADER_LOGO_MARKETING
  /** Home hero: transparent bar over imagery — light nav; scrolled bar uses dark text like other pages */
  const heroContrast = isHome && !scrolled

  const navBtnClass = (active = false) =>
    cn(
      "text-sm rounded-md px-2 py-1.5 transition-colors outline-none",
      heroContrast
        ? "font-bold text-white hover:bg-white/10 hover:text-white"
        : active
          ? "font-semibold text-primary hover:bg-primary/10 hover:text-primary"
          : "font-medium text-black hover:bg-muted hover:text-neutral-900",
    )

  const dropdownTriggerClass = cn(
    "inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors outline-none",
    heroContrast
      ? "font-bold text-white hover:bg-white/10 data-[state=open]:bg-white/15 data-[state=open]:text-white"
      : "font-medium text-black hover:bg-muted data-[state=open]:bg-muted data-[state=open]:text-black",
  )

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [isMenuOpen])

  /** Scroll to section on home, or navigate to `/#id` from other routes */
  const goToSection = (sectionId: string) => {
    setIsMenuOpen(false)
    const scroll = () => {
      const el = document.getElementById(sectionId)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    if (normalizedPath === "/") {
      scroll()
    } else {
      window.location.assign(`/#${sectionId}`)
    }
  }

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <>
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-white shadow-sm" : "bg-transparent shadow-none backdrop-blur-none"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18 gap-4 w-full min-w-0">
          {/* Logo — left */}
          <div className="flex items-center gap-2 shrink-0 min-w-0">
            <a href="/" className="relative h-12 w-40 sm:h-14 sm:w-48 cursor-pointer">
              <Image
                src={headerLogoSrc}
                alt="TG World"
                fill
                className="object-contain object-left"
                priority
                unoptimized={headerLogoSrc?.startsWith("http")}
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = "/placeholder-logo.svg"
                }}
                sizes="(max-width: 640px) 128px, 160px"
              />
            </a>
          </div>

          {/* Nav + Sign In + menu — right (same cluster as Sign In) */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 ml-auto shrink-0">
            <nav className="hidden lg:flex items-center justify-end gap-1 xl:gap-2">
              <button type="button" onClick={() => goToSection("home")} className={navBtnClass()}>
                Home
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger className={dropdownTriggerClass}>
                  Cars
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-[60] min-w-[12rem]">
                  <DropdownMenuItem onClick={() => goToSection("latest")}>Latest</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => goToSection("popular")}>Popular</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => goToSection("coming-soon-preview")}>Coming soon</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <button type="button" onClick={() => goToSection("content")} className={navBtnClass()}>
                Content
              </button>

              <DropdownMenu open={stockMenuOpen} onOpenChange={setStockMenuOpen}>
                <DropdownMenuTrigger className={cn(dropdownTriggerClass, isShopPage && !heroContrast && "font-semibold text-primary hover:bg-primary/10 hover:text-primary")}>
                  Stock list
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-[80] w-[min(860px,calc(100vw-2rem))] rounded-xl p-0 shadow-xl">
                  <div className="grid grid-cols-4 gap-8 p-7">
                    <div className="min-w-0">
                      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Search by make
                      </p>
                      <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
                        {stockCompanies.map((company) => (
                          <a
                            key={company.href}
                            href={company.href}
                            className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-primary"
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-background">
                                {company.logoUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={company.logoUrl}
                                    alt=""
                                    width={24}
                                    height={24}
                                    className="h-full w-full object-contain p-0.5"
                                  />
                                ) : (
                                  <span className="text-[10px] font-bold text-muted-foreground leading-none">
                                    {company.label.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </span>
                              <span className="min-w-0 truncate">{company.label}</span>
                            </span>
                            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                              ({company.count})
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                    {stockFilterColumns.map((column) => (
                      <div key={column.title} className="min-w-0">
                        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          {column.title}
                        </p>
                        <div className="space-y-1">
                          {column.items.map((item) => (
                            <a
                              key={item.href}
                              href={item.href}
                              className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-primary"
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                {"icon" in item && item.icon && (
                                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-background">
                                    <StockTypeIcon canon={item.icon} label={item.label} />
                                  </span>
                                )}
                                <span className="min-w-0 truncate">{item.label}</span>
                              </span>
                              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                                ({stockCounts[item.href] ?? 0})
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border bg-muted/40 px-7 py-4">
                    <a
                      href="/shop?stock=list"
                      className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700"
                    >
                      <span>View all stock</span>
                      {typeof totalStockCount === "number" && (
                        <span className="text-white/70 tabular-nums">({totalStockCount})</span>
                      )}
                    </a>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false)
                  router.push("/about")
                }}
                className={navBtnClass(isAboutPage)}
              >
                About Us
              </button>

              <button type="button" onClick={() => goToSection("contact")} className={navBtnClass()}>
                Get in touch
              </button>
            </nav>

            {/* Sign In button — temporarily hidden
            <Button
              variant="outline"
              onClick={() => router.push("/signin")}
              className={cn(
                "hidden md:inline-flex rounded-full bg-transparent px-6 font-bold h-10",
                heroContrast
                  ? "border-white/40 text-white hover:bg-white/10 hover:text-white"
                  : "border-black/25 text-black hover:bg-muted hover:text-black",
              )}
            >
              Sign In
            </Button>
            */}

            <button
              type="button"
              className={cn("lg:hidden p-2 shrink-0", heroContrast ? "text-white" : "text-black")}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>

    {stockMenuOpen && (
      <button
        type="button"
        aria-label="Close stock list"
        className="fixed inset-0 z-40 hidden cursor-default bg-black/15 backdrop-blur-md lg:block"
        onClick={() => setStockMenuOpen(false)}
      />
    )}

    {/* Fullscreen mobile / tablet menu — blur + subtle motion */}
    {isMenuOpen && (
      <div
        className="fixed inset-0 z-[100] lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
      >
        <div
          className="absolute inset-0 z-0 bg-black/45 backdrop-blur-md animate-in fade-in duration-300 ease-out"
          aria-hidden
        />
        <div
          className="relative z-[1] flex min-h-[100dvh] flex-col animate-in fade-in slide-in-from-top-3 duration-300 ease-out"
        >
          <div
            className={cn(
              "flex items-center justify-between px-5 sm:px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-4",
              "border-b border-white/10 bg-black/25 backdrop-blur-sm"
            )}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Menu</span>
            <button
              type="button"
              onClick={closeMenu}
              className="rounded-full p-2.5 text-white hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto overscroll-contain px-5 sm:px-6 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => goToSection("home")}
              className="text-left py-3.5 text-lg font-medium text-white rounded-xl hover:bg-white/10 transition-colors px-1"
            >
              Home
            </button>
            <p className="px-1 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-widest text-white/45">
              Cars
            </p>
            <button
              type="button"
              onClick={() => goToSection("latest")}
              className="text-left pl-4 py-3 text-base text-white/95 rounded-xl hover:bg-white/10 transition-colors"
            >
              Latest
            </button>
            <button
              type="button"
              onClick={() => goToSection("popular")}
              className="text-left pl-4 py-3 text-base text-white/95 rounded-xl hover:bg-white/10 transition-colors"
            >
              Popular
            </button>
            <button
              type="button"
              onClick={() => goToSection("coming-soon-preview")}
              className="text-left pl-4 py-3 text-base text-white/95 rounded-xl hover:bg-white/10 transition-colors"
            >
              Coming soon
            </button>
            <button
              type="button"
              onClick={() => goToSection("content")}
              className="text-left py-3.5 text-lg font-medium text-white rounded-xl hover:bg-white/10 transition-colors px-1 mt-2"
            >
              Content
            </button>
            <button
              type="button"
              onClick={() => {
                router.push("/shop?stock=list")
                closeMenu()
              }}
              className="text-left py-3.5 text-lg font-medium text-white rounded-xl hover:bg-white/10 transition-colors px-1"
            >
              Stock list
            </button>
            <button
              type="button"
              onClick={() => {
                router.push("/about")
                closeMenu()
              }}
              className="text-left py-3.5 text-lg font-medium text-white rounded-xl hover:bg-white/10 transition-colors px-1"
            >
              About Us
            </button>
            <button
              type="button"
              onClick={() => goToSection("contact")}
              className="text-left py-3.5 text-lg font-medium text-white rounded-xl hover:bg-white/10 transition-colors px-1"
            >
              Get in touch
            </button>

            {/* Sign In button (mobile) — temporarily hidden
            <div className="mt-auto pt-8 border-t border-white/10">
              <Button
                variant="outline"
                onClick={() => {
                  router.push("/signin")
                  closeMenu()
                }}
                className="w-full rounded-full bg-transparent border-white/30 text-white hover:bg-white/15 hover:text-white"
              >
                Sign In
              </Button>
            </div>
            */}
          </nav>
        </div>
      </div>
    )}
    </>
  )
}
