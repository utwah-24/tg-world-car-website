import { ContentReviewsSection } from "./content-reviews-section"
import { fetchContent } from "@/lib/api"

export async function ContentReviewsWrapper() {
  // Fetch content videos from API
  const videos = await fetchContent()

  // Don't render if no videos
  if (videos.length === 0) {
    return null
  }

  return <ContentReviewsSection videos={videos} />
}
