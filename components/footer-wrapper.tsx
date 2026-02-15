import { Footer } from "./footer"
import { fetchLogos } from "@/lib/api"

export async function FooterWrapper() {
  // Fetch logos from API
  const logos = await fetchLogos()

  return <Footer logoLight={logos.light} />
}
