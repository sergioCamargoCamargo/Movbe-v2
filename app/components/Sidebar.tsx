import {
  Home,
  Tv,
  Music,
  SmilePlus,
  Gamepad2,
  Clock,
  ThumbsUp,
  Flame,
  ShoppingBag,
  X,
  Upload,
  Mail,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { NavigationLink } from '@/components/NavigationLink'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks'
import {
  closeSidebar,
  setNavigating,
  setPageTransitioning,
  resetNavigation,
} from '@/lib/store/slices/sidebarSlice'

export default function Sidebar() {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const { isOpen, isNavigating } = useAppSelector(state => state.sidebar)
  const dispatch = useAppDispatch()
  const pathname = usePathname()

  const onClose = () => dispatch(closeSidebar())

  // Routes that are not available yet
  const unavailableRoutes = [
    '/trending',
    '/subscriptions', 
    '/category/news',
    '/category/music',
    '/category/comedy',
    '/category/gaming',
    '/history',
    '/liked'
  ]

  // Handle route changes - reset navigation state and close sidebar
  useEffect(() => {
    dispatch(setNavigating(true))
    dispatch(closeSidebar())

    // Reset navigation state after a short delay
    const timer = setTimeout(() => {
      dispatch(setNavigating(false))
      dispatch(setPageTransitioning(false))
      dispatch(resetNavigation())
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname, dispatch])

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Trigger animation after component mounts
      setTimeout(() => setIsAnimating(true), 10)
    } else {
      setIsAnimating(false)
      // Hide component after animation completes (reduced duration)
      setTimeout(() => setIsVisible(false), 400)
    }
  }, [isOpen])

  const sidebarContent = (
    <div className='p-4 space-y-4'>
      <Button variant='ghost' className='w-full justify-start' onClick={onClose}>
        <X className='mr-2 h-4 w-4' />
        Cerrar
      </Button>
      <Button variant='ghost' className='w-full justify-start' asChild>
        <NavigationLink href='/'>
          <Home className='mr-2 h-4 w-4' />
          Inicio
        </NavigationLink>
      </Button>
      <Button variant='ghost' className='w-full justify-start' asChild>
        <NavigationLink href='/upload'>
          <Upload className='mr-2 h-4 w-4' />
          Subir Video
        </NavigationLink>
      </Button>
      <Button 
        variant='ghost' 
        className='w-full justify-start opacity-50 cursor-not-allowed' 
        disabled
      >
        <Flame className='mr-2 h-4 w-4' />
        Tendencias
      </Button>
      <Button 
        variant='ghost' 
        className='w-full justify-start opacity-50 cursor-not-allowed' 
        disabled
      >
        <ShoppingBag className='mr-2 h-4 w-4' />
        Suscripciones
      </Button>
      <hr className='my-4' />
      <h3 className='mb-2 px-4 text-lg font-semibold tracking-tight'>Categorías</h3>
      <Button 
        variant='ghost' 
        className='w-full justify-start opacity-50 cursor-not-allowed' 
        disabled
      >
        <Tv className='mr-2 h-4 w-4' />
        Noticias
      </Button>
      <Button 
        variant='ghost' 
        className='w-full justify-start opacity-50 cursor-not-allowed' 
        disabled
      >
        <Music className='mr-2 h-4 w-4' />
        Música
      </Button>
      <Button 
        variant='ghost' 
        className='w-full justify-start opacity-50 cursor-not-allowed' 
        disabled
      >
        <SmilePlus className='mr-2 h-4 w-4' />
        Videos de risa
      </Button>
      <Button 
        variant='ghost' 
        className='w-full justify-start opacity-50 cursor-not-allowed' 
        disabled
      >
        <Gamepad2 className='mr-2 h-4 w-4' />
        Videojuegos
      </Button>
      <hr className='my-4' />
      <h3 className='mb-2 px-4 text-lg font-semibold tracking-tight'>Biblioteca</h3>
      <Button 
        variant='ghost' 
        className='w-full justify-start opacity-50 cursor-not-allowed' 
        disabled
      >
        <Clock className='mr-2 h-4 w-4' />
        Historial
      </Button>
      <Button 
        variant='ghost' 
        className='w-full justify-start opacity-50 cursor-not-allowed' 
        disabled
      >
        <ThumbsUp className='mr-2 h-4 w-4' />
        Videos que me gustan
      </Button>
      <hr className='my-4' />
      <Button variant='ghost' className='w-full justify-start' asChild>
        <NavigationLink href='/contact'>
          <Mail className='mr-2 h-4 w-4' />
          Contacto
        </NavigationLink>
      </Button>
    </div>
  )

  // Don't render during navigation or if not visible
  if (!isVisible || isNavigating) return null

  return (
    <>
      {/* Overlay for both mobile and desktop */}
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-500 ease-in-out ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Sidebar - Always overlay with smooth animation */}
      <div
        className={`
          fixed top-0 md:top-16 left-0 w-64 h-full md:h-[calc(100vh-4rem)] 
          border-r bg-background z-50 
          transform transition-all duration-400 ease-out
          ${isAnimating ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-90'}
        `}
      >
        <ScrollArea className='h-full'>{sidebarContent}</ScrollArea>
      </div>
    </>
  )
}
