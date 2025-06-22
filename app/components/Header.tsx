'use client'

import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth'
import { Bell, Menu, Mic, Search, Upload, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

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

export default function Header({
  visible = true,
  onMenuClick,
}: {
  visible?: boolean
  onMenuClick?: () => void
}) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

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
        <Link href='/' className='flex items-center ml-4'>
          <Image
            src='/logo_black.png'
            alt='Movbe'
            width={120}
            height={40}
            className='dark:hidden'
          />
          <Image
            src='/logo_white.png'
            alt='Movbe'
            width={120}
            height={40}
            className='hidden dark:block'
          />
        </Link>
      </div>
      <div className='flex-1 max-w-2xl mx-4'>
        <div className='flex'>
          <Input type='search' placeholder='Buscar' className='rounded-r-none' />
          <Button className='rounded-l-none'>
            <Search className='h-4 w-4' />
          </Button>
          <Button variant='ghost' size='icon' className='ml-2'>
            <Mic className='h-6 w-6' />
          </Button>
        </div>
      </div>
      <div className='flex items-center space-x-2'>
        {!loading && user ? (
          <>
            <Button variant='ghost' size='icon'>
              <Upload className='h-6 w-6' />
            </Button>
            <Button variant='ghost' size='icon'>
              <Bell className='h-6 w-6' />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                  <Avatar className='h-8 w-8'>
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'Usuario'} />
                    <AvatarFallback>
                      <User className='h-4 w-4' />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-56' align='end' forceMount>
                <DropdownMenuLabel className='font-normal'>
                  <div className='flex flex-col space-y-1'>
                    <p className='text-sm font-medium leading-none'>{user.displayName || 'Usuario'}</p>
                    <p className='text-xs leading-none text-muted-foreground'>{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Cerrar sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <div className='flex items-center space-x-2'>
            <Button variant='outline' asChild>
              <Link href='/auth/login'>Iniciar sesión</Link>
            </Button>
            <Button asChild>
              <Link href='/auth/register'>Registrarse</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}