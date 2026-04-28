import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { HeaderWrapper } from "@/components/header-wrapper"
import { FooterWrapper } from "@/components/footer-wrapper"
import { ContentPageClient } from "@/components/content-page-client"
import { Button } from "@/components/ui/button"
import { fetchContent } from "@/lib/api"

export const metadata = {
  title: "Video content | TG World",
  description: "Browse all TG World car review videos and video content.",
}

export const revalidate = 0

export default async function AllContentPage() {
  const videos = await fetchContent()

  return (
    <main className="min-h-screen bg-black text-white">
      <HeaderWrapper />

      <div className="pt-24 pb-16 lg:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <Button
                asChild
                variant="ghost"
                className="mb-4 -ml-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
              >
                <Link href="/" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to home
                </Link>
              </Button>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">All video content</h1>
              <p className="mt-2 text-white/60 text-sm sm:text-base max-w-2xl">
                Every review and clip from our catalog — streamed from TG World&apos;s content library.
              </p>
            </div>
            <p className="text-white/50 text-sm shrink-0">{videos.length} {videos.length === 1 ? "video" : "videos"}</p>
          </div>

          {videos.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-16 text-center">
              <p className="text-white/80 font-medium">No videos available right now.</p>
              <p className="text-white/50 text-sm mt-2">Check back soon for new content.</p>
              <Button asChild className="mt-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/">Return home</Link>
              </Button>
            </div>
          ) : (
            <ContentPageClient videos={videos} />
          )}
        </div>
      </div>

      <FooterWrapper />
    </main>
  )
}
