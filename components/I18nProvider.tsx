'use client'

import { useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'

import i18n from '@/lib/i18n'

import { LanguageHandler } from './LanguageHandler'

interface I18nProviderProps {
  children: React.ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // Asegurar que i18n esté inicializado
    if (!i18n.isInitialized) {
      i18n.init()
    }
  }, [])

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageHandler />
      {children}
    </I18nextProvider>
  )
}
