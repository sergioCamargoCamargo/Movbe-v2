'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface SidebarContextType {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
  isNavigating: boolean
  navigateTo: (url: string) => void
  isPageTransitioning: boolean
  destinationUrl: string | null
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isPageTransitioning, setIsPageTransitioning] = useState(false)
  const [destinationUrl, setDestinationUrl] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  // Handle navigation state
  useEffect(() => {
    setIsNavigating(true)
    setIsSidebarOpen(false)

    // Reset navigation state after a short delay
    const timer = setTimeout(() => {
      setIsNavigating(false)
      setIsPageTransitioning(false)
      setDestinationUrl(null) // Reset destination URL
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname])

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  const navigateTo = (url: string) => {
    // Si es la misma página, no hacer nada
    if (pathname === url) return

    // Establecer la URL de destino para mostrar el esqueleto correcto
    setDestinationUrl(url)
    setIsPageTransitioning(true)

    if (isSidebarOpen) {
      // Si el sidebar está abierto, cerrarlo primero
      setIsSidebarOpen(false)
      setIsNavigating(true)

      // Esperar menos tiempo para una transición más rápida
      setTimeout(() => {
        router.push(url)
      }, 400) // Reducido de 700ms a 400ms
    } else {
      // Si el sidebar está cerrado, añadir una pequeña transición
      setTimeout(() => {
        router.push(url)
      }, 150) // Pequeña pausa para suavizar
    }
  }

  return (
    <SidebarContext.Provider
      value={{
        isSidebarOpen,
        toggleSidebar,
        closeSidebar,
        isNavigating,
        navigateTo,
        isPageTransitioning,
        destinationUrl,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
