import { Skeleton } from '@/components/ui/skeleton'

import { HeaderSkeleton } from './HeaderSkeleton'
import { SidebarSkeleton } from './SidebarSkeleton'

export function HomeSkeleton() {
  return (
    <div className='flex flex-col min-h-screen'>
      <HeaderSkeleton />
      <div className='flex flex-1 pt-16'>
        <SidebarSkeleton />
        <div className='flex-1 overflow-x-hidden w-full min-w-0'>
          <div className='p-1 xs:p-2 sm:p-4 mobile-container'>
            {/* Banner skeleton */}
            <Skeleton className='w-full h-20 sm:h-24 rounded-lg mb-4 animate-pulse' />

            {/* Categories skeleton */}
            <div className='flex space-x-2 pb-4 overflow-hidden'>
              {[...Array(7)].map((_, i) => (
                <Skeleton
                  key={i}
                  className='h-8 w-16 sm:w-20 rounded-md flex-shrink-0 animate-pulse'
                />
              ))}
            </div>

            {/* Video grid skeleton */}
            <div className='video-grid'>
              {[...Array(12)].map((_, i) => (
                <div key={i} className='space-y-2 animate-pulse'>
                  {/* Video thumbnail */}
                  <Skeleton className='aspect-video w-full rounded-lg bg-gradient-to-r from-muted via-muted/80 to-muted' />
                  {/* Video title */}
                  <Skeleton className='h-4 w-full bg-gradient-to-r from-muted via-muted/80 to-muted' />
                  <Skeleton className='h-3 w-3/4 bg-gradient-to-r from-muted via-muted/80 to-muted' />
                  {/* Channel name */}
                  <Skeleton className='h-3 w-1/2 bg-gradient-to-r from-muted via-muted/80 to-muted' />
                  {/* Views and date */}
                  <Skeleton className='h-3 w-2/3 bg-gradient-to-r from-muted via-muted/80 to-muted' />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
