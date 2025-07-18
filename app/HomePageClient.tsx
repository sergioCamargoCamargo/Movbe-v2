'use client'

import HeaderDynamic from '@/components/HeaderDynamic'
import MainContentClient from '@/components/MainContentClient'
import { PageTransition } from '@/components/PageTransition'
import Sidebar from '@/components/Sidebar'
import { Video, Category } from '@/lib/firestore'
import { useAppDispatch } from '@/lib/store/hooks'
import { toggleSidebar } from '@/lib/store/slices/sidebarSlice'

interface HomePageClientProps {
  initialVideos: Video[]
  categories: Category[]
}

export default function HomePageClient({ initialVideos, categories }: HomePageClientProps) {
  const dispatch = useAppDispatch()

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
