import { getPublicVideos, getCategories, initializeCategories } from '@/lib/firestore'

import HomePageClient from './HomePageClient'

// Enable ISR - revalidate every 5 minutes
export const revalidate = 300

export default async function HomePage() {
  try {
    // Initialize categories if they don't exist
    await initializeCategories()
    
    const [videos, categories] = await Promise.all([getPublicVideos(24), getCategories()])

    return <HomePageClient initialVideos={videos} categories={categories} />
  } catch (error) {
    console.error('Error fetching home page data:', error)
    
    // If categories fail, try to get videos only
    try {
      const videos = await getPublicVideos(24)
      return <HomePageClient initialVideos={videos} categories={[]} />
    } catch (videoError) {
      console.error('Error fetching videos:', videoError)
      // Return with empty data in case of complete failure
      return <HomePageClient initialVideos={[]} categories={[]} />
    }
  }
}
