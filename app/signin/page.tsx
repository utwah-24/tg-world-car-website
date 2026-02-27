import { fetchLogos } from "@/lib/api"
import { SignInContent } from "./signin-content"

export default async function SignInPage() {
  const logos = await fetchLogos()

  return <SignInContent darkLogoUrl={logos.dark} />
}
