'use client'

import { useState } from 'react'

import Header from './components/Header'
import MainContent from './components/MainContent'
import Sidebar from './components/Sidebar'

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className='flex flex-col h-screen'>
      <Header onMenuClick={toggleSidebar} />
      <div className='flex flex-1 overflow-hidden pt-16'>
        <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
        <MainContent isSidebarOpen={isSidebarOpen} />
      </div>
    </div>
  )
}
