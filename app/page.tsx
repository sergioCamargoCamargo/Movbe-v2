'use client'

import { PageTransition } from '@/components/PageTransition'
import { useAppDispatch } from '@/lib/store/hooks'
import { toggleSidebar } from '@/lib/store/slices/sidebarSlice'

import HeaderDynamic from './components/HeaderDynamic'
import MainContent from './components/MainContent'
import Sidebar from './components/Sidebar'

export default function Home() {
  const dispatch = useAppDispatch()

  return (
    <PageTransition>
      <div className='flex flex-col min-h-screen'>
        <HeaderDynamic onMenuClick={() => dispatch(toggleSidebar())} />
        <div className='flex flex-1 pt-16 overflow-hidden'>
          <Sidebar />
          <div className='flex-1 min-w-0 overflow-y-auto overflow-x-hidden w-full md:h-auto mobile-scroll-container ios-scroll-fix'>
            <MainContent />
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
