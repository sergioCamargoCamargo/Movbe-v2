import { CategoryService } from '@/lib/services/CategoryService'
import { VideoService } from '@/lib/services/VideoService'

import HomePageClient from './HomePageClient'

// Enable ISR - revalidate every 5 minutes
export const revalidate = 300

export default async function HomePage() {
  const videoService = new VideoService()
  const categoryService = new CategoryService()

  try {
    // Initialize categories if they don't exist
    await categoryService.initializeCategories()

    const [videos, categories] = await Promise.all([
      videoService.getPublicVideos(24),
      categoryService.getCategories(),
    ])

    return <HomePageClient initialVideos={videos} categories={categories} />
  } catch (error) {
    console.error('Error fetching home page data:', error)

    // If categories fail, try to get videos only
    try {
      const videos = await videoService.getPublicVideos(24)
      return <HomePageClient initialVideos={videos} categories={[]} />
    } catch (videoError) {
      console.error('Error fetching videos:', videoError)
      // Return with empty data in case of complete failure
      return <HomePageClient initialVideos={[]} categories={[]} />
    }
  }
}
