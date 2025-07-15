'use client'

import { AlertTriangle, Shield, UserCheck } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

interface AgeVerificationAlertProps {
  onConfirm: () => void
  isOpen: boolean
}

export function AgeVerificationAlert({ onConfirm, isOpen }: AgeVerificationAlertProps) {
  const [isVisible, setIsVisible] = useState(isOpen)

  useEffect(() => {
    setIsVisible(isOpen)
  }, [isOpen])

  if (!isVisible) return null

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm'>
      <div className='bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700'>
        <div className='text-center mb-6'>
          <div className='mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4'>
            <AlertTriangle className='h-10 w-10 text-red-600 dark:text-red-400' />
          </div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
            Verificación de Edad Requerida
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            Este sitio contiene contenido para una comunidad mayor de 18 años
          </p>
        </div>

        <div className='text-center mb-8'>
          <p className='text-xl font-semibold text-gray-900 dark:text-white mb-3'>
            Para acceder a este sitio
          </p>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Debes ser mayor de edad para acceder a este contenido. Al continuar, confirmas que
            cumples con los requisitos legales.
          </p>
        </div>

        <div className='flex justify-center'>
          <Button
            onClick={onConfirm}
            className='w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-4 text-lg font-semibold'
          >
            <UserCheck className='h-5 w-5' />
            SOY MAYOR DE EDAD
          </Button>
        </div>

        <div className='mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800'>
          <div className='flex items-start gap-3'>
            <Shield className='h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0' />
            <div className='space-y-1'>
              <p className='text-sm font-medium text-amber-800 dark:text-amber-200'>Aviso Legal</p>
              <p className='text-xs text-amber-700 dark:text-amber-300'>
                Este sitio está destinado exclusivamente a adultos mayores de 18 años. Al acceder,
                aceptas que cumples con los requisitos de edad en tu jurisdicción.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
