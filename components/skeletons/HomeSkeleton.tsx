import { Skeleton } from '@/components/ui/skeleton'

import { HeaderSkeleton } from './HeaderSkeleton'
import { SidebarSkeleton } from './SidebarSkeleton'

export function HomeSkeleton() {
  return (
    <div className='flex flex-col h-screen'>
      <HeaderSkeleton />
      <div className='flex flex-1 overflow-hidden pt-16'>
        <SidebarSkeleton />
        <div className='flex-1 overflow-auto'>
          <div className='p-2 md:p-4'>
            {/* Banner skeleton */}
            <Skeleton className='w-full h-24 rounded-lg mb-4' />

            {/* Categories skeleton */}
            <div className='flex space-x-2 pb-4 overflow-hidden'>
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className='h-8 w-20 rounded-md flex-shrink-0' />
              ))}
            </div>

            {/* Video grid skeleton */}
            <div className='grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-4'>
              {[...Array(12)].map((_, i) => (
                <div key={i} className='space-y-2'>
                  {/* Video thumbnail */}
                  <Skeleton className='aspect-video w-full rounded-lg' />
                  {/* Video title */}
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-3 w-3/4' />
                  {/* Channel name */}
                  <Skeleton className='h-3 w-1/2' />
                  {/* Views and date */}
                  <Skeleton className='h-3 w-2/3' />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
