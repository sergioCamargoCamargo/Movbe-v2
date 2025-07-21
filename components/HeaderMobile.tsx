'use client'

import { signOut } from 'firebase/auth'
import { Menu, Search, Upload, User, BarChart3, Settings, X } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// import { LanguageMenuItem } from '@/components/LanguageMenuItem'
import { NavigationLink } from '@/components/NavigationLink'
import { ThemeMenuItem } from '@/components/ThemeMenuItem'
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
import { useSearch } from '@/lib/hooks/useSearch'
import { useAppSelector } from '@/lib/store/hooks'

export default function HeaderMobile({
  visible = true,
  onMenuClick,
}: {
  visible?: boolean
  onMenuClick?: () => void
}) {
  const { user, loading } = useAppSelector(state => state.auth)
  const { query, updateQuery, searchAndNavigate } = useSearch()
  const [mounted, setMounted] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [localQuery, setLocalQuery] = useState('')
  const { t } = useTranslation()

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

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (localQuery.trim()) {
      updateQuery(localQuery)
      searchAndNavigate(localQuery)
      setShowMobileSearch(false)
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

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-background border-b transition-transform duration-300 h-16 ${visible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className='absolute top-0 left-0 right-0 bg-background border-b p-4'>
          <form onSubmit={handleMobileSearch} className='flex items-center gap-2'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={toggleMobileSearch}
              className='touch-manipulation'
            >
              <X className='h-5 w-5' />
            </Button>
            <div className='flex-1 relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder={t('search.placeholder')}
                className='pl-10 touch-manipulation'
                value={localQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleInputKeyDown}
                autoFocus
              />
            </div>
          </form>
        </div>
      )}

      {/* Main Header Content */}
      <div
        className={`flex items-center justify-between px-4 h-full ${showMobileSearch ? 'hidden' : ''}`}
      >
        <div className='flex items-center'>
          <Button variant='ghost' size='icon' onClick={onMenuClick} className='touch-manipulation'>
            <Menu className='h-6 w-6' />
          </Button>
          <NavigationLink href='/' className='flex items-center ml-2'>
            <Image
              src='/logo_black.png'
              alt='Movbe'
              width={100}
              height={32}
              className='dark:hidden w-16 h-8'
            />
            <Image
              src='/logo_white.png'
              alt='Movbe'
              width={100}
              height={32}
              className='hidden dark:block w-16 h-8'
            />
          </NavigationLink>
        </div>

        {/* Mobile Right Section */}
        <div className='flex items-center space-x-2'>
          {/* Search button */}
          <Button
            variant='ghost'
            size='icon'
            className='touch-manipulation'
            onClick={toggleMobileSearch}
          >
            <Search className='h-5 w-5' />
          </Button>

          {!mounted || loading ? (
            // Loading state
            <div className='flex items-center space-x-2'>
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
              <NavigationLink href='/upload'>
                <Button variant='ghost' size='icon' className='touch-manipulation'>
                  <Upload className='h-6 w-6' />
                </Button>
              </NavigationLink>
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
                    <span>{user.displayName || t('auth.user')}</span>
                    <span className='text-sm text-muted-foreground font-normal'>{user.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <NavigationLink href={`/profile/${user.uid}`}>
                    <DropdownMenuItem>
                      <User className='mr-2 h-4 w-4' />
                      {t('nav.profile')}
                    </DropdownMenuItem>
                  </NavigationLink>
                  <NavigationLink href='/analytics'>
                    <DropdownMenuItem>
                      <BarChart3 className='mr-2 h-4 w-4' />
                      {t('nav.analytics')}
                    </DropdownMenuItem>
                  </NavigationLink>
                  <NavigationLink href='/settings'>
                    <DropdownMenuItem>
                      <Settings className='mr-2 h-4 w-4' />
                      {t('nav.settings')}
                    </DropdownMenuItem>
                  </NavigationLink>
                  <DropdownMenuSeparator />
                  <ThemeMenuItem />
                  {/* <LanguageMenuItem /> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>{t('auth.signOut')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            // User is not logged in
            <NavigationLink href='/auth/login'>
              <Button
                variant='outline'
                className='touch-manipulation text-sm flex items-center gap-2 rounded-full border-2'
              >
                <User className='h-4 w-4' />
                {t('auth.login')}
              </Button>
            </NavigationLink>
          )}
        </div>
      </div>
    </header>
  )
}
