import { Skeleton } from '@/components/ui/skeleton'

import { HeaderSkeleton } from './HeaderSkeleton'

export function WatchSkeleton() {
  return (
    <div className='flex flex-col min-h-screen pt-16'>
      <HeaderSkeleton />
      <div className='flex-1 overflow-x-hidden overflow-y-auto w-full min-w-0'>
        <div className='p-1 xs:p-2 sm:p-4 space-y-4 pb-safe-area-inset-bottom w-full min-w-0 max-w-full'>
          {/* Video player skeleton */}
          <div className='aspect-video bg-gradient-to-r from-muted via-muted/80 to-muted rounded-lg animate-pulse' />

          <div className='space-y-4'>
            {/* Video title */}
            <Skeleton className='h-6 sm:h-8 w-full max-w-2xl bg-gradient-to-r from-muted via-muted/80 to-muted animate-pulse' />

            {/* Channel info and actions */}
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4'>
              {/* Channel info */}
              <div className='flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0'>
                <Skeleton className='h-10 w-10 rounded-full bg-gradient-to-r from-muted via-muted/80 to-muted animate-pulse flex-shrink-0' />
                <div className='flex-1 min-w-0'>
                  <Skeleton className='h-4 w-32 mb-1 bg-gradient-to-r from-muted via-muted/80 to-muted animate-pulse' />
                  <Skeleton className='h-3 w-24 bg-gradient-to-r from-muted via-muted/80 to-muted animate-pulse' />
                </div>
                <Skeleton className='h-8 w-20 bg-gradient-to-r from-muted via-muted/80 to-muted animate-pulse flex-shrink-0' />
              </div>

              {/* Action buttons */}
              <div className='flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto'>
                {[...Array(5)].map((_, i) => (
                  <Skeleton
                    key={i}
                    className='h-8 w-16 sm:w-20 bg-gradient-to-r from-muted via-muted/80 to-muted animate-pulse'
                  />
                ))}
              </div>
            </div>

            {/* Description box */}
            <div className='bg-muted/30 p-3 sm:p-4 rounded-lg space-y-2 animate-pulse'>
              <Skeleton className='h-4 w-64 bg-gradient-to-r from-muted via-muted/80 to-muted' />
              <Skeleton className='h-4 w-full bg-gradient-to-r from-muted via-muted/80 to-muted' />
              <Skeleton className='h-4 w-3/4 bg-gradient-to-r from-muted via-muted/80 to-muted' />
            </div>

            {/* Comments section */}
            <div className='space-y-4'>
              <Skeleton className='h-6 w-32 bg-gradient-to-r from-muted via-muted/80 to-muted animate-pulse' />

              {/* Comments */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className='flex space-x-3 sm:space-x-4 animate-pulse'>
                  <Skeleton className='h-10 w-10 rounded-full flex-shrink-0 bg-gradient-to-r from-muted via-muted/80 to-muted' />
                  <div className='flex-1 space-y-2 min-w-0'>
                    <Skeleton className='h-4 w-24 bg-gradient-to-r from-muted via-muted/80 to-muted' />
                    <Skeleton className='h-4 w-full bg-gradient-to-r from-muted via-muted/80 to-muted' />
                    <Skeleton className='h-4 w-2/3 bg-gradient-to-r from-muted via-muted/80 to-muted' />
                    <div className='flex items-center space-x-2 sm:space-x-3'>
                      <Skeleton className='h-6 w-12 bg-gradient-to-r from-muted via-muted/80 to-muted' />
                      <Skeleton className='h-6 w-8 bg-gradient-to-r from-muted via-muted/80 to-muted' />
                      <Skeleton className='h-6 w-16 bg-gradient-to-r from-muted via-muted/80 to-muted' />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
