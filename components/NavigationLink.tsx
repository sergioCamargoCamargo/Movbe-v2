'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

import { useNavigation } from '@/lib/hooks/useNavigation'

interface NavigationLinkProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function NavigationLink({ href, children, className, onClick }: NavigationLinkProps) {
  const { navigateTo } = useNavigation()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onClick) onClick()
    navigateTo(href)
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}
