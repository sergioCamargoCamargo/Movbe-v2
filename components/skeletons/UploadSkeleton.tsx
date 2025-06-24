import { Skeleton } from '@/components/ui/skeleton'

import { HeaderSkeleton } from './HeaderSkeleton'
import { SidebarSkeleton } from './SidebarSkeleton'

export function UploadSkeleton() {
  return (
    <div className='flex flex-col h-screen'>
      <HeaderSkeleton />
      <div className='flex flex-1 overflow-hidden pt-16'>
        <SidebarSkeleton />
        <div className='flex-1 overflow-auto bg-background p-2 sm:p-4'>
          <div className='max-w-2xl mx-auto px-2 sm:px-0'>
            {/* Header skeleton */}
            <div className='mb-4 sm:mb-6'>
              <Skeleton className='h-8 sm:h-10 w-48 mb-2' />
              <Skeleton className='h-4 w-72' />
            </div>

            {/* Card skeleton */}
            <div className='border rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6'>
              {/* Card header */}
              <div className='space-y-2'>
                <Skeleton className='h-6 w-48' />
                <Skeleton className='h-4 w-64' />
              </div>

              {/* Title input skeleton */}
              <div className='space-y-2'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-12 w-full' />
              </div>

              {/* Description skeleton */}
              <div className='space-y-2'>
                <Skeleton className='h-4 w-40' />
                <Skeleton className='h-20 w-full' />
              </div>

              {/* File upload area skeleton */}
              <div className='space-y-2'>
                <Skeleton className='h-4 w-36' />
                <div className='border-2 border-dashed rounded-lg p-4 sm:p-6 space-y-3'>
                  <Skeleton className='h-8 w-8 rounded-full mx-auto' />
                  <Skeleton className='h-4 w-64 mx-auto' />
                  <Skeleton className='h-3 w-80 mx-auto' />
                </div>
              </div>

              {/* Upload button skeleton */}
              <Skeleton className='h-12 w-full' />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
