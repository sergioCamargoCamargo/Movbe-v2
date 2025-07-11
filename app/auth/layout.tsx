import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Autenticación - Movbe',
  description: 'Inicia sesión o regístrate en Movbe',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children
}
