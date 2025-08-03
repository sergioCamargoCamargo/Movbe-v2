'use client'

import { useEffect } from 'react'
import HeaderDynamic from '@/components/HeaderDynamic'
import MainContentClient from '@/components/MainContentClient'
import { PageTransition } from '@/components/PageTransition'
import Sidebar from '@/components/Sidebar'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { Video } from '@/lib/services/VideoService'
import { useAppDispatch } from '@/lib/store/hooks'
import { toggleSidebar } from '@/lib/store/slices/sidebarSlice'
import { Category } from '@/lib/types/entities/category'

interface HomePageClientProps {
  initialVideos: Video[]
  categories: Category[]
}

export default function HomePageClient({ initialVideos, categories }: HomePageClientProps) {
  const dispatch = useAppDispatch()
  const { trackPage, trackCustomEvent } = useAnalytics()

  useEffect(() => {
    trackPage('Home Page')
    trackCustomEvent('page_view', 'Home', 'homepage_loaded', initialVideos.length)
  }, [trackPage, trackCustomEvent, initialVideos.length])

  return (
    <PageTransition>
      <div className='flex flex-col min-h-screen'>
        <HeaderDynamic onMenuClick={() => dispatch(toggleSidebar())} />
        <div className='flex flex-1 pt-20'>
          <Sidebar />
          <div className='flex-1 min-w-0'>
            <MainContentClient initialVideos={initialVideos} categories={categories} />
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
