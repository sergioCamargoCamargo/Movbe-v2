'use client'

import { useEffect, useState } from 'react'

import HeaderDesktop from './HeaderDesktop'
import HeaderMobile from './HeaderMobile'

export default function HeaderDynamic({
  visible = true,
  onMenuClick,
}: {
  visible?: boolean
  onMenuClick?: () => void
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  return (
    <>
      {isMobile ? (
        <HeaderMobile visible={visible} onMenuClick={onMenuClick} />
      ) : (
        <HeaderDesktop visible={visible} onMenuClick={onMenuClick} />
      )}
    </>
  )
}
