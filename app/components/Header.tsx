'use client'

import { signOut } from 'firebase/auth'
import { Bell, Menu, Mic, Search, Upload, User, BarChart3, Settings, X } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'

import { NavigationLink } from '@/components/NavigationLink'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { auth } from '@/lib/firebase'
import { useNavigation } from '@/lib/hooks/useNavigation'
import { useAppSelector } from '@/lib/store/hooks'

export default function Header({
  visible = true,
  onMenuClick,
}: {
  visible?: boolean
  onMenuClick?: () => void
}) {
  const { user, loading } = useAppSelector(state => state.auth)
  const { navigateTo } = useNavigation()
  const [mounted, setMounted] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch {
      // Error handled silently
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-background border-b transition-transform duration-300 ${visible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className='absolute top-0 left-0 right-0 bg-background border-b p-4 sm:hidden'>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setShowMobileSearch(false)}
              className='touch-manipulation'
            >
              <X className='h-5 w-5' />
            </Button>
            <div className='flex-1 relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Buscar videos...'
                className='pl-10 touch-manipulation'
                autoFocus
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Header Content */}
      <div
        className={`flex items-center justify-between p-4 ${showMobileSearch ? 'sm:flex hidden' : ''}`}
      >
        <div className='flex items-center'>
          <Button variant='ghost' size='icon' onClick={onMenuClick} className='touch-manipulation'>
            <Menu className='h-6 w-6' />
          </Button>
          <NavigationLink href='/' className='flex items-center ml-2 md:ml-4'>
            <Image
              src='/logo_black.png'
              alt='Movbe'
              width={100}
              height={32}
              className='dark:hidden w-16 h-auto sm:w-20 md:w-[120px]'
            />
            <Image
              src='/logo_white.png'
              alt='Movbe'
              width={100}
              height={32}
              className='hidden dark:block w-16 h-auto sm:w-20 md:w-[120px]'
            />
          </NavigationLink>
        </div>
        {/* Barra de búsqueda - visible solo en desktop */}
        <div className='flex-1 max-w-2xl mx-2 md:mx-4 hidden sm:block'>
          <div className='flex'>
            <Input
              type='search'
              placeholder='Buscar'
              className='rounded-r-none text-sm md:text-base'
            />
            <Button className='rounded-l-none px-3 md:px-4'>
              <Search className='h-4 w-4' />
            </Button>
            <Button variant='ghost' size='icon' className='ml-2 hidden md:flex touch-manipulation'>
              <Mic className='h-6 w-6' />
            </Button>
          </div>
        </div>

        {/* Botones de la derecha */}
        <div className='flex items-center space-x-2 md:space-x-4'>
          {/* Buscar móvil */}
          <Button
            variant='ghost'
            size='icon'
            className='sm:hidden touch-manipulation'
            onClick={() => setShowMobileSearch(true)}
          >
            <Search className='h-5 w-5' />
          </Button>
          {!mounted || loading ? (
            // Loading state or initial render
            <div className='flex items-center space-x-2 md:space-x-4'>
              <Button variant='ghost' size='icon' disabled>
                <Upload className='h-6 w-6' />
              </Button>
              <Button variant='ghost' size='icon' disabled>
                <User className='h-6 w-6' />
              </Button>
            </div>
          ) : user ? (
            // User is logged in
            <>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => navigateTo('/upload')}
                className='touch-manipulation'
              >
                <Upload className='h-6 w-6' />
              </Button>
              <Button variant='ghost' size='icon' className='hidden md:flex touch-manipulation'>
                <Bell className='h-6 w-6' />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' className='h-10 w-10 rounded-full p-0 touch-manipulation'>
                    <Avatar className='h-8 w-8'>
                      <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                      <AvatarFallback>
                        {user.displayName ? (
                          user.displayName.charAt(0).toUpperCase()
                        ) : user.email ? (
                          user.email.charAt(0).toUpperCase()
                        ) : (
                          <User className='h-4 w-4' />
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-56'>
                  <DropdownMenuLabel className='flex flex-col'>
                    <span>{user.displayName || 'Usuario'}</span>
                    <span className='text-sm text-muted-foreground font-normal'>{user.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigateTo(`/profile/${user.uid}`)}>
                    <User className='mr-2 h-4 w-4' />
                    Mi Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo('/analytics')}>
                    <BarChart3 className='mr-2 h-4 w-4' />
                    Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo('/settings')}>
                    <Settings className='mr-2 h-4 w-4' />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Cerrar sesión</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            // User is not logged in
            <div className='flex items-center space-x-1 md:space-x-2'>
              <Button
                variant='ghost'
                onClick={() => navigateTo('/auth/login')}
                className='touch-manipulation text-sm'
              >
                Iniciar sesión
              </Button>
              <Button
                onClick={() => navigateTo('/auth/register')}
                className='touch-manipulation text-sm'
              >
                Registrarse
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
