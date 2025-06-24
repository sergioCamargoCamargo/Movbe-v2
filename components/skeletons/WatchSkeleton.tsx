import { Skeleton } from '@/components/ui/skeleton'

import { HeaderSkeleton } from './HeaderSkeleton'

export function WatchSkeleton() {
  return (
    <div className='flex flex-col min-h-screen pt-16'>
      <HeaderSkeleton />
      <div className='flex-1 overflow-auto'>
        <div className='p-2 sm:p-4 space-y-4'>
          {/* Video player skeleton */}
          <div className='aspect-video bg-muted rounded-lg' />
          
          <div className='space-y-4'>
            {/* Video title */}
            <Skeleton className='h-6 sm:h-8 w-full max-w-2xl' />
            
            {/* Channel info and actions */}
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
              {/* Channel info */}
              <div className='flex items-center space-x-2 sm:space-x-4'>
                <Skeleton className='h-10 w-10 rounded-full' />
                <div className='flex-1'>
                  <Skeleton className='h-4 w-32 mb-1' />
                  <Skeleton className='h-3 w-24' />
                </div>
                <Skeleton className='h-8 w-20' />
              </div>
              
              {/* Action buttons */}
              <div className='flex flex-wrap items-center gap-2'>
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className='h-8 w-16 sm:w-20' />
                ))}
              </div>
            </div>
            
            {/* Description box */}
            <div className='bg-muted p-3 sm:p-4 rounded-lg space-y-2'>
              <Skeleton className='h-4 w-64' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
            </div>
            
            {/* Comments section */}
            <div className='space-y-4'>
              <Skeleton className='h-6 w-32' />
              
              {/* Comments */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className='flex space-x-2 sm:space-x-4'>
                  <Skeleton className='h-10 w-10 rounded-full flex-shrink-0' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-2/3' />
                    <div className='flex items-center space-x-1 sm:space-x-2'>
                      <Skeleton className='h-6 w-12' />
                      <Skeleton className='h-6 w-8' />
                      <Skeleton className='h-6 w-16' />
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