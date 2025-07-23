'use client'

import { Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'

const languages = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
]

export function LanguageMenuItem() {
  const { i18n, t } = useTranslation()

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode)
  }

  const currentLanguage =
    languages.find(lang => i18n.language.startsWith(lang.code)) || languages[0]

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Globe className='mr-2 h-4 w-4' />
        {t('language.changeLanguage')}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
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
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
