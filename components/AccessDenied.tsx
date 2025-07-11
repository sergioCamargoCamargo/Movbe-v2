'use client'

import { AlertTriangle, Home, LogIn } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AccessDeniedProps {
  title?: string
  message?: string
  showHomeButton?: boolean
  showLoginButton?: boolean
}

export default function AccessDenied({
  title = 'Acceso Denegado',
  message = 'No tienes permisos para acceder a esta sección. Contacta al administrador si crees que esto es un error.',
  showHomeButton = true,
  showLoginButton = false,
}: AccessDeniedProps) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4'>
            <AlertTriangle className='h-6 w-6 text-destructive' />
          </div>
          <CardTitle className='text-2xl font-bold'>{title}</CardTitle>
          <CardDescription className='text-center'>{message}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex flex-col gap-3'>
            {showHomeButton && (
              <Button asChild variant='default'>
                <Link href='/' className='flex items-center gap-2'>
                  <Home className='h-4 w-4' />
                  Ir al Inicio
                </Link>
              </Button>
            )}
            {showLoginButton && (
              <Button asChild variant='outline'>
                <Link href='/auth/login' className='flex items-center gap-2'>
                  <LogIn className='h-4 w-4' />
                  Iniciar Sesión
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
