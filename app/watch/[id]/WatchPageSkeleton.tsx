'use client'

import HeaderDynamic from '@/components/HeaderDynamic'
import Sidebar from '@/components/Sidebar'
import { useAppDispatch } from '@/lib/store/hooks'
import { toggleSidebar } from '@/lib/store/slices/sidebarSlice'


export default function WatchPageSkeleton() {
  const dispatch = useAppDispatch()

  return (
    <div className='flex flex-col min-h-screen'>
      <HeaderDynamic visible={true} onMenuClick={() => dispatch(toggleSidebar())} />
      <div className='flex flex-1 overflow-hidden pt-20'>
        <Sidebar />
        <div className='flex-1 w-full min-w-0 overflow-x-hidden overflow-y-auto md:h-auto mobile-scroll-container ios-scroll-fix'>
          <div className='p-1 xs:p-2 sm:p-4 space-y-4 pb-safe-area-inset-bottom w-full min-w-0 max-w-full'>
            {/* Video skeleton */}
            <div className='aspect-video bg-gray-200 rounded-lg animate-pulse' />

            {/* Title skeleton */}
            <div className='space-y-2'>
              <div className='h-6 bg-gray-200 rounded animate-pulse w-3/4' />
              <div className='h-4 bg-gray-200 rounded animate-pulse w-1/2' />
            </div>

            {/* Channel info skeleton */}
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-gray-200 rounded-full animate-pulse' />
              <div className='flex-1 space-y-1'>
                <div className='h-4 bg-gray-200 rounded animate-pulse w-1/3' />
                <div className='h-3 bg-gray-200 rounded animate-pulse w-1/4' />
              </div>
              <div className='w-20 h-8 bg-gray-200 rounded animate-pulse' />
            </div>

            {/* Description skeleton */}
            <div className='bg-gray-100 p-3 sm:p-4 rounded-lg space-y-2'>
              <div className='h-3 bg-gray-200 rounded animate-pulse w-1/4' />
              <div className='h-4 bg-gray-200 rounded animate-pulse w-full' />
              <div className='h-4 bg-gray-200 rounded animate-pulse w-2/3' />
            </div>

            {/* Interactions skeleton */}
            <div className='flex space-x-2'>
              <div className='w-16 h-8 bg-gray-200 rounded animate-pulse' />
              <div className='w-16 h-8 bg-gray-200 rounded animate-pulse' />
              <div className='w-16 h-8 bg-gray-200 rounded animate-pulse' />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
