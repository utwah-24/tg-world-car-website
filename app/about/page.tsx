import { HeaderWrapper } from "@/components/header-wrapper"
import { FooterWrapper } from "@/components/footer-wrapper"
import { AboutUsContent } from "@/components/about-us-content"

export const metadata = {
  title: "About Us | TG World",
  description:
    "Learn about TG World — trusted vehicles from Japan to Tanzania, and the team behind your car buying experience.",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <HeaderWrapper />

      <div className="pt-20 lg:pt-24">
        <AboutUsContent />
      </div>

      <FooterWrapper />
    </main>
  )
}
