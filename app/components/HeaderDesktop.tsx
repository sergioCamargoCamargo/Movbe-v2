'use client'

import { signOut } from 'firebase/auth'
import { Bell, Menu, Mic, Search, Upload, User, BarChart3, Settings } from 'lucide-react'
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
import { useSearch } from '@/lib/hooks/useSearch'
import { useAppSelector } from '@/lib/store/hooks'

export default function HeaderDesktop({
  visible = true,
  onMenuClick,
}: {
  visible?: boolean
  onMenuClick?: () => void
}) {
  const { user, loading } = useAppSelector(state => state.auth)
  const { navigateTo } = useNavigation()
  const { query, updateQuery, searchAndNavigate } = useSearch()
  const [mounted, setMounted] = useState(false)
  const [localQuery, setLocalQuery] = useState('')

  useEffect(() => {
    setLocalQuery(query)
  }, [query])

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (localQuery.trim()) {
      updateQuery(localQuery)
      searchAndNavigate(localQuery)
    }
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setLocalQuery('')
      updateQuery('')
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-background border-b transition-transform duration-300 ${visible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className='flex items-center justify-between p-4'>
        <div className='flex items-center'>
          <Button variant='ghost' size='icon' onClick={onMenuClick} className='touch-manipulation'>
            <Menu className='h-6 w-6' />
          </Button>
          <NavigationLink href='/' className='flex items-center ml-4'>
            <Image
              src='/logo_black.png'
              alt='Movbe'
              width={100}
              height={32}
              className='dark:hidden w-[120px] h-auto'
            />
            <Image
              src='/logo_white.png'
              alt='Movbe'
              width={100}
              height={32}
              className='hidden dark:block w-[120px] h-auto'
            />
          </NavigationLink>
        </div>

        {/* Desktop Search Bar */}
        <div className='flex-1 max-w-2xl mx-4'>
          <form onSubmit={handleSearch} className='flex'>
            <Input
              type='search'
              placeholder='Buscar'
              className='rounded-r-none text-base'
              value={localQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleInputKeyDown}
            />
            <Button type='submit' className='rounded-l-none px-4'>
              <Search className='h-4 w-4' />
            </Button>
            <Button variant='ghost' size='icon' className='ml-2 touch-manipulation'>
              <Mic className='h-6 w-6' />
            </Button>
          </form>
        </div>

        {/* Desktop Right Section */}
        <div className='flex items-center space-x-4'>
          {!mounted || loading ? (
            // Loading state
            <div className='flex items-center space-x-4'>
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
              <Button variant='ghost' size='icon' className='touch-manipulation'>
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
            <Button
              variant='outline'
              onClick={() => navigateTo('/auth/login')}
              className='touch-manipulation text-sm flex items-center gap-2 rounded-full border-2'
            >
              <User className='h-4 w-4' />
              Iniciar sesión
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
