'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { closeSidebar } from '@/lib/store/slices/sidebarSlice'

interface NavigationLinkProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function NavigationLink({ href, children, className, onClick }: NavigationLinkProps) {
  const dispatch = useAppDispatch()
  const { isOpen: isSidebarOpen } = useAppSelector(state => state.sidebar)

  const handleClick = () => {
    if (onClick) {
      onClick()
    }

    // Simply close sidebar if it's open, let Next.js handle the rest
    if (isSidebarOpen) {
      dispatch(closeSidebar())
    }
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}
