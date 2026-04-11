"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { CarCard } from "@/components/car-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Car } from "@/lib/cars-data"
import type { CompanyLogo } from "@/lib/api"
import {
  filterCarsByCriteria,
  uniqueTypes,
  uniqueCompanies,
  uniqueBrands,
  uniqueModelNames,
  normalizeType,
  type FindCarCriteria,
} from "@/lib/find-your-car-filter"
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = 6

const CONDITIONS: { id: FindCarCriteria["condition"]; label: string; desc: string }[] = [
  { id: "new", label: "New", desc: "Brand-new vehicles" },
  { id: "second_hand", label: "Second hand", desc: "Pre-owned, inspected" },
  { id: "third_party", label: "Third party", desc: "Trusted partner listings" },
]

function formatTypeLabel(raw: string): string {
  const t = raw.toLowerCase()
  if (t === "suv") return "SUV"
  if (t === "truck" || t === "trucks") return "Trucks"
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
}

interface FindYourCarWizardProps {
  cars: Car[]
  companyLogos: CompanyLogo[]
}

export function FindYourCarWizard({ cars, companyLogos }: FindYourCarWizardProps) {
  const [step, setStep] = useState(1)
  const [showResults, setShowResults] = useState(false)

  const [selectedType, setSelectedType] = useState("")
  const [selectedCompany, setSelectedCompany] = useState("")
  const [selectedBrand, setSelectedBrand] = useState("")
  const [selectedModel, setSelectedModel] = useState("")
  const [selectedCondition, setSelectedCondition] = useState<FindCarCriteria["condition"]>("")
  const [priceMin, setPriceMin] = useState("")
  const [priceMax, setPriceMax] = useState("")
  const [yearMin, setYearMin] = useState("")
  const [yearMax, setYearMax] = useState("")

  const logoMap = useMemo(() => {
    const m = new Map<string, string>()
    companyLogos.forEach(({ company, logoUrl }) => m.set(company.trim().toLowerCase(), logoUrl))
    return m
  }, [companyLogos])

  const types = useMemo(() => uniqueTypes(cars), [cars])
  const companies = useMemo(
    () => uniqueCompanies(cars, selectedType || undefined),
    [cars, selectedType]
  )
  const brands = useMemo(
    () => uniqueBrands(cars, selectedType || undefined, selectedCompany || undefined),
    [cars, selectedType, selectedCompany]
  )
  const models = useMemo(
    () =>
      uniqueModelNames(
        cars,
        selectedType || undefined,
        selectedCompany || undefined,
        selectedBrand || undefined
      ),
    [cars, selectedType, selectedCompany, selectedBrand]
  )

  const criteria: FindCarCriteria = useMemo(() => {
    const pmin = priceMin.trim() ? parseFloat(priceMin.replace(/,/g, "")) : undefined
    const pmax = priceMax.trim() ? parseFloat(priceMax.replace(/,/g, "")) : undefined
    const ymin = yearMin.trim() ? parseInt(yearMin, 10) : undefined
    const ymax = yearMax.trim() ? parseInt(yearMax, 10) : undefined
    return {
      type: selectedType || undefined,
      company: selectedCompany || undefined,
      brand: selectedBrand || undefined,
      modelName: selectedModel || undefined,
      condition: selectedCondition ? selectedCondition : undefined,
      priceMinMillion: pmin != null && !Number.isNaN(pmin) ? pmin : undefined,
      priceMaxMillion: pmax != null && !Number.isNaN(pmax) ? pmax : undefined,
      yearMin: ymin != null && !Number.isNaN(ymin) ? ymin : undefined,
      yearMax: ymax != null && !Number.isNaN(ymax) ? ymax : undefined,
    }
  }, [selectedType, selectedCompany, selectedBrand, selectedModel, selectedCondition, priceMin, priceMax, yearMin, yearMax])

  const results = useMemo(() => filterCarsByCriteria(cars, criteria), [cars, criteria])

  const goNext = () => {
    if (step < STEPS) setStep((s) => s + 1)
  }

  const goBack = () => {
    if (showResults) {
      setShowResults(false)
      setStep(STEPS)
      return
    }
    if (step > 1) setStep((s) => s - 1)
  }

  const runSearch = () => {
    setShowResults(true)
  }

  const resetWizard = () => {
    setStep(1)
    setShowResults(false)
    setSelectedType("")
    setSelectedCompany("")
    setSelectedBrand("")
    setSelectedModel("")
    setSelectedCondition("")
    setPriceMin("")
    setPriceMax("")
    setYearMin("")
    setYearMax("")
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!selectedType || types.length === 0
      case 2:
        return !!selectedCompany || companies.length === 0
      case 3:
        return !!selectedBrand || brands.length === 0
      case 4:
        return !!selectedModel || models.length === 0
      case 5:
        return true
      case 6:
        return true
      default:
        return false
    }
  }

  const summaryChips = useMemo(() => {
    const chips: { key: string; label: string; value: string; logoUrl?: string }[] = []
    // Show each field only after the user has moved past that step (step > n)
    if (step >= 2 && selectedType) {
      chips.push({ key: "type", label: "Type", value: formatTypeLabel(selectedType) })
    }
    if (step >= 3 && selectedCompany) {
      const logoUrl = logoMap.get(selectedCompany.trim().toLowerCase())
      chips.push({ key: "company", label: "Company", value: selectedCompany, logoUrl })
    }
    if (step >= 4 && selectedBrand) chips.push({ key: "brand", label: "Brand", value: selectedBrand })
    if (step >= 5 && selectedModel) chips.push({ key: "model", label: "Model", value: selectedModel })

    if (selectedCondition && step >= 5) {
      const c = CONDITIONS.find((x) => x.id === selectedCondition)
      chips.push({ key: "condition", label: "Condition", value: c?.label ?? String(selectedCondition) })
    } else if ((showResults || step >= 6) && !selectedCondition) {
      chips.push({ key: "condition", label: "Condition", value: "Any condition" })
    }

    const pastBudgetStep = showResults || step >= 6
    if (pastBudgetStep) {
      const budgetBits: string[] = []
      if (priceMin.trim()) budgetBits.push(`from ${priceMin}M`)
      if (priceMax.trim()) budgetBits.push(`to ${priceMax}M`)
      if (budgetBits.length) {
        chips.push({
          key: "budget",
          label: "Budget",
          value: `${budgetBits.join(" · ")} Million Tshs`,
        })
      }
      const ymin = yearMin.trim()
      const ymax = yearMax.trim()
      if (ymin && ymax) {
        chips.push({ key: "year", label: "Year", value: `${ymin}–${ymax}` })
      } else if (ymin) {
        chips.push({ key: "year", label: "Year", value: `from ${ymin}` })
      } else if (ymax) {
        chips.push({ key: "year", label: "Year", value: `to ${ymax}` })
      }
    }

    return chips
  }, [
    selectedType,
    selectedCompany,
    selectedBrand,
    selectedModel,
    selectedCondition,
    step,
    showResults,
    priceMin,
    priceMax,
    yearMin,
    yearMax,
    logoMap,
  ])

  const selectionSummary = (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-muted/30 px-3 py-3 sm:px-4 sm:py-3.5 transition-all duration-300",
        summaryChips.length > 0 ? "animate-in fade-in slide-in-from-top-1 duration-300" : "hidden"
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Your selections</p>
      <div className="flex flex-wrap gap-2">
        {summaryChips.map((chip) => (
          <div
            key={chip.key}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-1.5 text-sm shadow-sm"
          >
            <span className="text-muted-foreground text-xs">{chip.label}</span>
            <span className="font-semibold text-foreground tabular-nums flex items-center gap-1.5">
              {chip.logoUrl ? (
                <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-md border border-border/60 bg-white">
                  <Image src={chip.logoUrl} alt="" width={20} height={20} className="object-contain p-0.5" unoptimized />
                </span>
              ) : null}
              {chip.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  if (showResults) {
    return (
      <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
        <div className="mb-8">{selectionSummary}</div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Your matches</h2>
            <p className="text-muted-foreground mt-1">
              {results.length} {results.length === 1 ? "vehicle" : "vehicles"} match your criteria
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full" onClick={resetWizard}>
              Start over
            </Button>
            <Button asChild variant="default" className="rounded-full">
              <Link href="/shop">Browse all cars</Link>
            </Button>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/40 px-8 py-16 text-center">
            <p className="text-lg font-medium text-foreground mb-2">No cars match those choices</p>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
              Try widening your price or year range, pick a different model, or start again with a new combination.
            </p>
            <Button onClick={resetWizard} className="rounded-full">
              Try again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {results.map((car, index) => (
              <CarCard key={car.id} car={car} delay={index * 80} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress — compact on small screens so it fits without clipping */}
      <div className="mb-10 w-full min-w-0">
        <div
          className={cn(
            "overflow-x-auto overflow-y-hidden py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "-mx-1 px-1 sm:mx-0 sm:px-0"
          )}
        >
          <div
            className={cn(
              "mx-auto flex w-max max-w-none items-center justify-center gap-0.5 sm:gap-2"
            )}
          >
          {Array.from({ length: STEPS }, (_, i) => i + 1).map((n) => (
            <div key={n} className="flex shrink-0 items-center gap-0.5 sm:gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 sm:h-9 sm:w-9 sm:text-sm",
                  step >= n
                    ? "bg-primary text-primary-foreground shadow-md sm:scale-105"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step > n ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : n}
              </div>
              {n < STEPS && (
                <div
                  className={cn(
                    "h-0.5 w-3 shrink-0 rounded-full transition-colors duration-300 sm:w-8 md:w-10",
                    step > n ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
          </div>
        </div>
      </div>

      <div className="mb-6">{selectionSummary}</div>

      <div
        key={step}
        className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        <div className="flex items-center gap-2 text-primary mb-2">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-widest">Step {step} of {STEPS}</span>
        </div>

        {step === 1 && (
          <>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Vehicle type</h3>
            <p className="text-muted-foreground text-sm mb-8">Choose the body style you are looking for. Types come from our live inventory.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {types.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedType(t)}
                  className={cn(
                    "rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all duration-200 hover:border-primary/50",
                    normalizeType(selectedType) === normalizeType(t)
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-border bg-background"
                  )}
                >
                  {formatTypeLabel(t)}
                </button>
              ))}
            </div>
            {types.length === 0 && (
              <p className="text-sm text-muted-foreground">No vehicle types available yet. Check back soon.</p>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Company</h3>
            <p className="text-muted-foreground text-sm mb-8">Select a manufacturer. Logos load from our directory.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
              {companies.map((company) => {
                const logoUrl = logoMap.get(company.trim().toLowerCase())
                return (
                  <button
                    key={company}
                    type="button"
                    onClick={() => setSelectedCompany(company)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all duration-200",
                      selectedCompany === company
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg border border-border/60 bg-background overflow-hidden">
                      {logoUrl ? (
                        <Image src={logoUrl} alt="" width={40} height={40} className="object-contain p-1" unoptimized />
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground">{company.charAt(0)}</span>
                      )}
                    </div>
                    <span className="font-medium text-foreground truncate">{company}</span>
                  </button>
                )
              })}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Brand</h3>
            <p className="text-muted-foreground text-sm mb-8">Pick the model line for {selectedCompany}.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {brands.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBrand(b)}
                  className={cn(
                    "rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all duration-200",
                    selectedBrand === b ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40"
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
            {brands.length === 0 && <p className="text-sm text-muted-foreground">No brands for this combination.</p>}
          </>
        )}

        {step === 4 && (
          <>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Model</h3>
            <p className="text-muted-foreground text-sm mb-8">
              Pick the model code from our catalog (e.g. X3M). This matches the database model field, not the full listing title.
            </p>
            <div className="grid grid-cols-1 gap-2 max-h-[380px] overflow-y-auto">
              {models.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedModel(name)}
                  className={cn(
                    "rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all duration-200",
                    selectedModel === name ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
            {models.length === 0 && <p className="text-sm text-muted-foreground">No models for this brand yet.</p>}
          </>
        )}

        {step === 5 && (
          <>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Condition</h3>
            <p className="text-muted-foreground text-sm mb-8">Optional — leave as “Any” by skipping selection, or tap one.</p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setSelectedCondition("")}
                className={cn(
                  "w-full rounded-xl border-2 px-4 py-4 text-left transition-all duration-200",
                  selectedCondition === "" ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                <span className="font-semibold">Any condition</span>
                <span className="block text-xs text-muted-foreground mt-1">Do not filter by condition</span>
              </button>
              {CONDITIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCondition(c.id || "")}
                  className={cn(
                    "w-full rounded-xl border-2 px-4 py-4 text-left transition-all duration-200",
                    selectedCondition === c.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                  )}
                >
                  <span className="font-semibold">{c.label}</span>
                  <span className="block text-xs text-muted-foreground mt-1">{c.desc}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 6 && (
          <>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Budget & year</h3>
            <div className="rounded-2xl border border-primary/20 bg-primary/[0.06] px-4 py-4 sm:px-5 sm:py-4 mb-6">
              <p className="text-base sm:text-lg font-semibold text-foreground leading-snug tracking-tight">
                You can fill or not fill — it&apos;s okay. TG World will find your car.
              </p>
            </div>
            <p className="text-muted-foreground text-sm mb-8">
              Enter amounts in millions of TZS (numbers only).
            </p>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pmin">Price from (Million Tshs)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="pmin"
                      inputMode="decimal"
                      placeholder="e.g. 50"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="rounded-xl"
                    />
                    <span className="text-sm text-muted-foreground shrink-0">Million Tshs</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pmax">Price to (Million Tshs)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="pmax"
                      inputMode="decimal"
                      placeholder="e.g. 200"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="rounded-xl"
                    />
                    <span className="text-sm text-muted-foreground shrink-0">Million Tshs</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ymin">Year from</Label>
                  <Input
                    id="ymin"
                    inputMode="numeric"
                    placeholder="e.g. 2018"
                    value={yearMin}
                    onChange={(e) => setYearMin(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ymax">Year to</Label>
                  <Input
                    id="ymax"
                    inputMode="numeric"
                    placeholder="e.g. 2026"
                    value={yearMax}
                    onChange={(e) => setYearMax(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-10 pt-8 border-t border-border">
          <Button type="button" variant="ghost" className="rounded-full gap-2" onClick={goBack} disabled={step === 1}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex-1 sm:text-right">
            {step < STEPS ? (
              <Button
                type="button"
                className="rounded-full gap-2 w-full sm:w-auto"
                onClick={goNext}
                disabled={!canProceed()}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button type="button" className="rounded-full gap-2 w-full sm:w-auto" onClick={runSearch}>
                Show matching cars
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
