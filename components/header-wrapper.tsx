import { Header } from "./header"
import { fetchLogos } from "@/lib/api"

export async function HeaderWrapper() {
  const logos = await fetchLogos()
  return <Header logoLight={logos.light} logoDark={logos.dark} />
}
