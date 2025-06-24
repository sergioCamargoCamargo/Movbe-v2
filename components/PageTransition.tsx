'use client'

import { ReactNode } from 'react'

import { useSidebar } from '@/contexts/SidebarContext'

import { PageSkeleton } from './PageSkeleton'

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const { isPageTransitioning } = useSidebar()

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        isPageTransitioning ? 'opacity-50 scale-[0.98]' : 'opacity-100 scale-100'
      }`}
    >
      {children}

      {/* Skeleton overlay durante la transición */}
      {isPageTransitioning && (
        <div className='fixed inset-0 bg-background z-[100] overflow-auto'>
          <PageSkeleton />
        </div>
      )}
    </div>
  )
}
