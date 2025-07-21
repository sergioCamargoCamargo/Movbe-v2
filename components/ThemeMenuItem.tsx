'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

export function ThemeMenuItem() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <DropdownMenuItem onClick={() => setTheme(isDark ? 'light' : 'dark')}>
      {isDark ? <Sun className='mr-2 h-4 w-4' /> : <Moon className='mr-2 h-4 w-4' />}
      {isDark ? t('theme.lightMode') : t('theme.darkMode')}
    </DropdownMenuItem>
  )
}
