'use client'

import { Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const languages = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
]

export function LanguageSelector() {
  const { i18n, t } = useTranslation()

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode)
  }

  const currentLanguage =
    languages.find(lang => i18n.language.startsWith(lang.code)) || languages[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-8 w-8'>
          <Globe className='h-4 w-4' />
          <span className='sr-only'>{t('language.changeLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {languages.map(language => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className='flex items-center gap-2'
          >
            <span className='text-base'>{language.flag}</span>
            <span className='flex-1'>{language.name}</span>
            {currentLanguage.code === language.code && <span className='text-primary'>✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
