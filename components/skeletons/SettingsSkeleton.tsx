import { Skeleton } from '@/components/ui/skeleton'

import { HeaderSkeleton } from './HeaderSkeleton'
import { SidebarSkeleton } from './SidebarSkeleton'

export function SettingsSkeleton() {
  return (
    <div className='flex flex-col h-screen'>
      <HeaderSkeleton />
      <div className='flex flex-1 overflow-hidden pt-16'>
        <SidebarSkeleton />
        <div className='flex-1 overflow-auto bg-gradient-to-br from-background via-background to-muted/30 p-2 sm:p-4 md:p-6 lg:p-8'>
          <div className='max-w-4xl mx-auto'>
            {/* Header skeleton */}
            <div className='mb-6 sm:mb-8'>
              <div className='text-center sm:text-left'>
                <Skeleton className='h-8 sm:h-10 md:h-12 w-80 mx-auto sm:mx-0 mb-2' />
                <Skeleton className='h-4 md:h-5 w-96 mx-auto sm:mx-0' />
              </div>
            </div>

            <div className='space-y-4 sm:space-y-6 md:space-y-8'>
              {/* Profile Section Skeleton */}
              <div className='border rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6 md:space-y-8'>
                {/* Card header */}
                <div className='space-y-2'>
                  <Skeleton className='h-6 w-56' />
                  <Skeleton className='h-4 w-80' />
                </div>

                {/* Profile info with avatar */}
                <div className='flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-muted/20 rounded-xl'>
                  <Skeleton className='h-20 w-20 sm:h-24 sm:w-24 rounded-full' />
                  <div className='text-center sm:text-left space-y-2 flex-1'>
                    <Skeleton className='h-5 w-32' />
                    <Skeleton className='h-4 w-48' />
                    <Skeleton className='h-8 w-28' />
                    <Skeleton className='h-3 w-36' />
                  </div>
                </div>

                {/* Form fields */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
                  <div className='space-y-3'>
                    <Skeleton className='h-4 w-32' />
                    <Skeleton className='h-12 w-full' />
                  </div>
                  <div className='space-y-3'>
                    <Skeleton className='h-4 w-36' />
                    <Skeleton className='h-12 w-full' />
                  </div>
                </div>

                {/* Save button */}
                <div className='flex justify-center sm:justify-end'>
                  <Skeleton className='h-12 w-40' />
                </div>
              </div>

              {/* Security Section Skeleton */}
              <div className='border rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6'>
                <div className='space-y-2'>
                  <Skeleton className='h-6 w-24' />
                  <Skeleton className='h-4 w-64' />
                </div>

                {/* Security options */}
                {[...Array(2)].map((_, i) => (
                  <div key={i} className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border'>
                    <div className='flex items-start gap-3 flex-1'>
                      <Skeleton className='h-8 w-8 rounded-lg' />
                      <div className='space-y-2'>
                        <Skeleton className='h-5 w-40' />
                        <Skeleton className='h-4 w-72' />
                      </div>
                    </div>
                    <Skeleton className='h-9 w-24' />
                  </div>
                ))}
              </div>

              {/* Notifications Section Skeleton */}
              <div className='border rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6'>
                <div className='space-y-2'>
                  <Skeleton className='h-6 w-32' />
                  <Skeleton className='h-4 w-80' />
                </div>

                {/* Notification toggles */}
                {[...Array(2)].map((_, i) => (
                  <div key={i} className='flex items-center justify-between p-4 rounded-lg border'>
                    <div className='flex items-center gap-3'>
                      <Skeleton className='h-8 w-8 rounded-lg' />
                      <div className='space-y-1'>
                        <Skeleton className='h-5 w-44' />
                        <Skeleton className='h-4 w-64' />
                      </div>
                    </div>
                    <Skeleton className='h-6 w-11 rounded-full' />
                  </div>
                ))}
              </div>

              {/* Danger Zone Skeleton */}
              <div className='border border-red-200 rounded-lg p-4 sm:p-6'>
                <div className='space-y-2 mb-4'>
                  <Skeleton className='h-6 w-32' />
                  <Skeleton className='h-4 w-72' />
                </div>
                
                <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border border-red-200'>
                  <div className='flex items-start gap-3 flex-1'>
                    <Skeleton className='h-8 w-8 rounded-lg' />
                    <div className='space-y-2'>
                      <Skeleton className='h-5 w-36' />
                      <Skeleton className='h-4 w-80' />
                      <Skeleton className='h-3 w-48' />
                    </div>
                  </div>
                  <Skeleton className='h-9 w-32' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}