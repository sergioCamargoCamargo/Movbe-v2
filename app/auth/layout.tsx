import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Autenticación - YourTube',
  description: 'Inicia sesión o regístrate en YourTube',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children
}
