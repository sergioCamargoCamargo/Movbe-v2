'use client'

<<<<<<< HEAD
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'
=======
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'
>>>>>>> 3d27034 (feat: add login)
import * as React from 'react'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
