'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Play } from 'lucide-react'
import Image from 'next/image'

import { NavigationLink } from '@/components/NavigationLink'
import StarRating from '@/components/StarRating'
import { Video } from '@/lib/firestore'

interface VideoCardProps {
  video: Video
  className?: string
  priority?: boolean
}

export default function VideoCard({ video, className = '', priority = false }: VideoCardProps) {
  const formatViewCount = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views.toString()
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getTimeAgo = (date: unknown) => {
    if (!date) return 'Hace un momento'

    let publishDate: Date
    if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
      publishDate = date.toDate()
    } else if (date instanceof Date) {
      publishDate = date
    } else {
      publishDate = new Date(date as string)
    }

    return formatDistanceToNow(publishDate, { addSuffix: true, locale: es })
  }

  return (
    <div className={`space-y-2 w-full min-w-0 max-w-full ${className}`}>
      <NavigationLink href={`/watch/${video.id}`} className='space-y-2 block w-full max-w-full'>
        <div className='aspect-video bg-muted rounded-lg overflow-hidden relative group w-full max-w-full'>
          <Image
            src={video.thumbnailURL || '/placeholder.svg?text=Video'}
            alt={video.title}
            fill
            sizes='(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw'
            className='object-cover w-full h-full'
            priority={priority}
          />
          <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100'>
            <Play className='text-white w-12 h-12' />
          </div>
          {video.duration > 0 && (
            <div className='absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded'>
              {formatDuration(video.duration)}
            </div>
          )}
        </div>
        <div className='space-y-1 w-full min-w-0 max-w-full'>
          <h3
            className='font-semibold text-sm md:text-base line-clamp-2 w-full max-w-full break-words overflow-hidden'
            title={video.title}
          >
            {video.title}
          </h3>
          <p
            className='text-xs md:text-sm text-muted-foreground truncate w-full max-w-full'
            title={video.uploaderName}
          >
            {video.uploaderName}
          </p>
          <div className='flex items-center justify-between w-full'>
            <div className='text-xs text-muted-foreground truncate flex-1'>
              {formatViewCount(video.viewCount)} vistas •{' '}
              {getTimeAgo(video.publishedAt || video.uploadDate)}
            </div>
            {video?.rating && video?.rating > 0 && (
              <StarRating
                rating={video?.rating || 0}
                readonly
                size='sm'
                showValue
                className='flex-shrink-0'
              />
            )}
          </div>
        </div>
      </NavigationLink>
    </div>
  )
}
