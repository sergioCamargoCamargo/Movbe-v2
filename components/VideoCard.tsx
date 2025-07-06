'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Play } from 'lucide-react'
import Image from 'next/image'

import { NavigationLink } from '@/components/NavigationLink'
import { Video } from '@/lib/firestore'

interface VideoCardProps {
  video: Video
  className?: string
}

export default function VideoCard({ video, className = '' }: VideoCardProps) {
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
    <div className={`space-y-2 ${className}`}>
      <NavigationLink href={`/watch/${video.id}`} className='space-y-2 block'>
        <div className='aspect-video bg-muted rounded-lg overflow-hidden relative group'>
          <Image
            src={video.thumbnailURL || '/placeholder.svg?text=Video'}
            alt={video.title}
            width={320}
            height={180}
            className='object-cover w-full h-full'
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
        <div className='space-y-1'>
          <h3 className='font-semibold text-sm md:text-base line-clamp-2' title={video.title}>
            {video.title}
          </h3>
          <p className='text-xs md:text-sm text-muted-foreground' title={video.uploaderName}>
            {video.uploaderName}
          </p>
          <div className='text-xs text-muted-foreground'>
            {formatViewCount(video.viewCount)} vistas •{' '}
            {getTimeAgo(video.publishedAt || video.uploadDate)}
          </div>
        </div>
      </NavigationLink>
    </div>
  )
}
