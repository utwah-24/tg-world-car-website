import { HeaderWrapper } from "@/components/header-wrapper"
import { FooterWrapper } from "@/components/footer-wrapper"
import { FindYourCarWizard } from "@/components/find-your-car-wizard"
import { getAllCars } from "@/lib/cars-data"
import { fetchCompanyLogos } from "@/lib/api"

export const metadata = {
  title: "Find your car | TG World",
  description: "Step through type, company, brand, model, condition, and budget to see matching vehicles.",
}

export const revalidate = 0

export default async function FindYourCarPage() {
  const [allCars, companyLogos] = await Promise.all([getAllCars(), fetchCompanyLogos()])

  return (
    <main className="min-h-screen bg-background">
      <HeaderWrapper />
      <div className="pt-24 pb-16 lg:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto mb-12 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Find your car</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Answer a few questions — we filter our live inventory to match your preferences.
          </p>
        </div>
        <FindYourCarWizard cars={allCars} companyLogos={companyLogos} />
      </div>
      <FooterWrapper />
    </main>
  )
}
