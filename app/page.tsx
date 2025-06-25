'use client'

import { PageTransition } from '@/components/PageTransition'
import { useAppDispatch } from '@/lib/store/hooks'
import { toggleSidebar } from '@/lib/store/slices/sidebarSlice'

import Header from './components/Header'
import MainContent from './components/MainContent'
import Sidebar from './components/Sidebar'

export default function Home() {
  const dispatch = useAppDispatch()

  return (
    <PageTransition>
      <div className='flex flex-col h-screen'>
        <Header onMenuClick={() => dispatch(toggleSidebar())} />
        <div className='flex flex-1 overflow-hidden pt-16'>
          <Sidebar />
          <MainContent />
        </div>
      </div>
    </PageTransition>
  )
}
