import { Metadata } from 'next'
import { Suspense } from 'react'

import { REVALIDATION_TIME_SECONDS } from '@/lib/constants/timing'
import { VideoService } from '@/lib/services/VideoService'

import WatchPageClient from './WatchPageClient'
import WatchPageSkeleton from './WatchPageSkeleton'

// Add ISR revalidation for video data
export const revalidate = REVALIDATION_TIME_SECONDS

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  try {
    const videoService = new VideoService()
    const video = await videoService.getVideoById(id)

    if (!video) {
      return {
        title: 'Video no encontrado | MOVBE',
        description: 'El video que buscas no existe o ha sido eliminado.',
      }
    }

    return {
      title: `${video.title} | MOVBE`,
      description: video.description || `Video de ${video.uploaderName} en MOVBE`,
      openGraph: {
        title: video.title,
        description: video.description || `Video de ${video.uploaderName} en MOVBE`,
        images: video.thumbnailURL ? [video.thumbnailURL] : [],
        type: 'video.other',
        siteName: 'MOVBE',
      },
      twitter: {
        card: 'summary_large_image',
        title: video.title,
        description: video.description || `Video de ${video.uploaderName} en MOVBE`,
        images: video.thumbnailURL ? [video.thumbnailURL] : [],
      },
    }
  } catch {
    return {
      title: 'Error al cargar video | MOVBE',
      description: 'Hubo un problema al cargar el video solicitado.',
    }
  }
}

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Suspense fallback={<WatchPageSkeleton />}>
      <WatchPageContent id={id} />
    </Suspense>
  )
}

async function WatchPageContent({ id }: { id: string }) {
  try {
    const videoService = new VideoService()
    const [video, allVideos] = await Promise.all([
      videoService.getVideoById(id),
      videoService.getPublicVideos(10),
    ])

    const recommendedVideos = allVideos.filter(v => v.id !== id)

    return <WatchPageClient video={video} recommendedVideos={recommendedVideos} />
  } catch {
    return <WatchPageClient video={null} recommendedVideos={[]} />
  }
}
