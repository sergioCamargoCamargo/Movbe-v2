'use client'

import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth'
import { Bell, Menu, Mic, Search, Upload, User } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

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
import { useSidebar } from '@/contexts/SidebarContext'
import { auth } from '@/lib/firebase'

export default function Header({
  visible = true,
  onMenuClick,
}: {
  visible?: boolean
  onMenuClick?: () => void
}) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const { navigateTo } = useSidebar()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
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
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-background border-b transition-transform duration-300 ${visible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className='flex items-center'>
        <Button variant='ghost' size='icon' onClick={onMenuClick}>
          <Menu className='h-6 w-6' />
        </Button>
        <NavigationLink href='/' className='flex items-center ml-2 md:ml-4'>
          <Image
            src='/logo_black.png'
            alt='Movbe'
            width={100}
            height={32}
            className='dark:hidden w-20 h-auto md:w-[120px]'
          />
          <Image
            src='/logo_white.png'
            alt='Movbe'
            width={100}
            height={32}
            className='hidden dark:block w-20 h-auto md:w-[120px]'
          />
        </NavigationLink>
      </div>
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
          <Button variant='ghost' size='icon' className='ml-2 hidden md:flex'>
            <Mic className='h-6 w-6' />
          </Button>
        </div>
      </div>
      <div className='flex items-center space-x-2 md:space-x-4'>
        {loading ? (
          // Loading state
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
            <Button variant='ghost' size='icon' onClick={() => navigateTo('/upload')}>
              <Upload className='h-6 w-6' />
            </Button>
            <Button variant='ghost' size='icon' className='hidden md:flex'>
              <Bell className='h-6 w-6' />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-10 w-10 rounded-full p-0'>
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
                <DropdownMenuItem onClick={() => navigateTo('/settings')}>
                  Configurar cuenta
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Cerrar sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          // User is not logged in
          <div className='flex items-center space-x-1 md:space-x-2'>
            <Button variant='ghost' onClick={() => navigateTo('/auth/login')}>
              Iniciar sesión
            </Button>
            <Button onClick={() => navigateTo('/auth/register')}>
              Registrarse
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
