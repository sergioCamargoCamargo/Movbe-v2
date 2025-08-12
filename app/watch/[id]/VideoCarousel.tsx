'use client'

import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { NavigationLink } from '@/components/NavigationLink'
import { Button } from '@/components/ui/button'
import { Video } from '@/lib/services/VideoService'

interface VideoCarouselProps {
  videos: Video[]
  onShow?: boolean
}

export default function VideoCarousel({ videos, onShow = true }: VideoCarouselProps) {
  const [centerIndex, setCenterIndex] = useState(2) // Start with middle item as center

  const handlePrev = () => {
    setCenterIndex(prev => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCenterIndex(prev => Math.min(videos.length - 1, prev + 1))
  }

  const getVideoScale = (index: number, isDesktop: boolean = true) => {
    const distance = Math.abs(index - centerIndex)
    if (!isDesktop) {
      // Mobile/tablet scaling
      if (distance === 0) return 1.1
      if (distance === 1) return 0.9
      return 0.7
    }
    // Desktop scaling
    if (distance === 0) return 1.2 // Central thumbnail (1.2x size)
    if (distance === 1) return 1.0 // Adjacent thumbnails
    if (distance === 2) return 0.8 // Edge thumbnails
    return 0.6 // Far thumbnails
  }

  const getVideoOpacity = (index: number) => {
    const distance = Math.abs(index - centerIndex)
    if (distance === 0) return 1.0 // Central thumbnail
    if (distance === 1) return 0.9 // Adjacent thumbnails
    if (distance === 2) return 0.7 // Edge thumbnails
    return 0.4 // Far thumbnails
  }

  const getTypographySize = (index: number, isDesktop: boolean = true) => {
    const isCentral = index === centerIndex
    if (!isDesktop) {
      return {
        title: isCentral ? 'text-xs' : 'text-[10px]',
        subtitle: isCentral ? 'text-[10px]' : 'text-[8px]',
      }
    }
    return {
      title: isCentral ? 'text-sm' : 'text-xs',
      subtitle: isCentral ? 'text-xs' : 'text-[10px]',
    }
  }

  if (!onShow || videos.length === 0) return null

  // Show 5 videos at a time, centered around centerIndex
  const visibleVideos = []
  const startIndex = Math.max(0, centerIndex - 2)
  const endIndex = Math.min(videos.length - 1, centerIndex + 2)

  for (let i = startIndex; i <= endIndex; i++) {
    visibleVideos.push({ video: videos[i], originalIndex: i })
  }

  return (
    <div className='px-2 sm:px-4 py-2 mb-6'>
      <h3 className='font-bold mb-4 text-sm sm:text-base px-2'>Videos recomendados</h3>
      <div className='relative'>
        {/* Navigation Arrows - Hidden on mobile */}
        {centerIndex > 0 && (
          <Button
            variant='ghost'
            size='icon'
            className='hidden sm:flex absolute left-2 top-1/3 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8'
            onClick={handlePrev}
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
        )}

        {centerIndex < videos.length - 1 && (
          <Button
            variant='ghost'
            size='icon'
            className='hidden sm:flex absolute right-2 top-1/3 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8'
            onClick={handleNext}
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        )}

        {/* Desktop Carousel Container */}
        <div className='hidden lg:flex items-end justify-between px-12 w-full min-h-[200px]'>
          {visibleVideos.map(({ video, originalIndex }) => {
            const scale = getVideoScale(originalIndex, true)
            const opacity = getVideoOpacity(originalIndex)
            const typography = getTypographySize(originalIndex, true)
            const isCentral = originalIndex === centerIndex

            return (
              <div
                key={`${video.id}-${originalIndex}`}
                className='flex flex-col items-center transition-all duration-300 ease-out flex-1'
                style={{
                  transform: `scale(${scale})`,
                  opacity,
                }}
              >
                <NavigationLink href={`/watch/${video.id}`} className='block w-full max-w-[160px]'>
                  <div
                    className={`aspect-square bg-transparent rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105 active:scale-95 relative group touch-manipulation border-2 border-border/50 w-full ${
                      isCentral ? 'shadow-lg ring-2 ring-primary/20' : ''
                    }`}
                  >
                    <Image
                      src={video.thumbnailURL || '/placeholder.svg?text=Video'}
                      alt={video.title}
                      fill
                      className='object-cover'
                    />
                    <div className='absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300'>
                      <div className='bg-black/50 rounded-full p-2'>
                        <Play className='text-white w-6 h-6' />
                      </div>
                    </div>
                  </div>
                  <div className='mt-1 space-y-0 w-full'>
                    <p
                      className={`${typography.title} font-medium line-clamp-2 leading-none text-center`}
                    >
                      {video.title}
                    </p>
                    <p
                      className={`${typography.subtitle} text-muted-foreground truncate text-center`}
                    >
                      {video.uploaderName}
                    </p>
                  </div>
                </NavigationLink>
              </div>
            )
          })}
        </div>

        {/* Tablet Carousel Container */}
        <div className='hidden sm:flex lg:hidden items-end justify-between px-8 w-full min-h-[180px]'>
          {visibleVideos.slice(1, 4).map(({ video, originalIndex }) => {
            const scale = getVideoScale(originalIndex, false)
            const opacity = getVideoOpacity(originalIndex)
            const typography = getTypographySize(originalIndex, false)
            const isCentral = originalIndex === centerIndex

            return (
              <div
                key={`tablet-${video.id}-${originalIndex}`}
                className='flex flex-col items-center transition-all duration-300 ease-out flex-1'
                style={{
                  transform: `scale(${scale})`,
                  opacity,
                }}
              >
                <NavigationLink href={`/watch/${video.id}`} className='block w-full max-w-[120px]'>
                  <div
                    className={`aspect-square bg-transparent rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 active:scale-95 relative group touch-manipulation border border-border/50 w-full ${
                      isCentral ? 'shadow-md ring-1 ring-primary/20' : ''
                    }`}
                  >
                    <Image
                      src={video.thumbnailURL || '/placeholder.svg?text=Video'}
                      alt={video.title}
                      fill
                      className='object-cover'
                    />
                    <div className='absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300'>
                      <div className='bg-black/50 rounded-full p-1.5'>
                        <Play className='text-white w-4 h-4' />
                      </div>
                    </div>
                  </div>
                  <div className='mt-1 space-y-0 w-full'>
                    <p
                      className={`${typography.title} font-medium line-clamp-2 leading-none text-center`}
                    >
                      {video.title}
                    </p>
                    <p
                      className={`${typography.subtitle} text-muted-foreground truncate text-center`}
                    >
                      {video.uploaderName}
                    </p>
                  </div>
                </NavigationLink>
              </div>
            )
          })}
        </div>

        {/* Mobile Carousel Container - Simple horizontal scroll */}
        <div className='flex sm:hidden overflow-x-auto gap-3 px-2 pb-2 scrollbar-hide'>
          {videos.slice(0, 6).map(video => (
            <div key={`mobile-${video.id}`} className='flex-shrink-0 w-24'>
              <NavigationLink href={`/watch/${video.id}`} className='block'>
                <div className='aspect-square bg-transparent rounded-lg overflow-hidden transform transition-all duration-300 active:scale-95 relative group touch-manipulation border border-border/50 w-full'>
                  <Image
                    src={video.thumbnailURL || '/placeholder.svg?text=Video'}
                    alt={video.title}
                    fill
                    className='object-cover'
                  />
                  <div className='absolute inset-0 flex items-center justify-center opacity-0 active:opacity-100 transition-opacity duration-300'>
                    <div className='bg-black/50 rounded-full p-1'>
                      <Play className='text-white w-3 h-3' />
                    </div>
                  </div>
                </div>
                <div className='mt-0.5 space-y-0 w-full'>
                  <p className='text-[9px] font-medium line-clamp-2 leading-none text-center'>
                    {video.title}
                  </p>
                  <p className='text-[8px] text-muted-foreground truncate text-center'>
                    {video.uploaderName}
                  </p>
                </div>
              </NavigationLink>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
