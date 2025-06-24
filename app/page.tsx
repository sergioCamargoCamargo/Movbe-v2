'use client'

import { PageTransition } from '@/components/PageTransition'
import { useSidebar } from '@/contexts/SidebarContext'

import Header from './components/Header'
import MainContent from './components/MainContent'
import Sidebar from './components/Sidebar'

export default function Home() {
  const { toggleSidebar } = useSidebar()

  return (
    <PageTransition>
      <div className='flex flex-col h-screen'>
        <Header onMenuClick={toggleSidebar} />
        <div className='flex flex-1 overflow-hidden pt-16'>
          <Sidebar />
          <MainContent />
        </div>
      </div>
    </PageTransition>
  )
}
