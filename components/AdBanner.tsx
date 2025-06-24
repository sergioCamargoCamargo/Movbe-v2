'use client'

import { X, ExternalLink, Play } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface AdBannerProps {
  type?: 'banner' | 'video' | 'interactive'
  size?: 'small' | 'medium' | 'large' | 'fullwidth'
  position?: 'top' | 'sidebar' | 'inline' | 'overlay'
  title?: string
  description?: string
  imageUrl?: string
  videoUrl?: string
  ctaText?: string
  ctaUrl?: string
  sponsor?: string
  className?: string
  closeable?: boolean
  onClose?: () => void
  onClick?: () => void
}

export function AdBanner({
  type = 'banner',
  size = 'medium',
  position = 'inline',
  title = 'Publicidad Patrocinada',
  description = 'Descubre productos y servicios increíbles',
  imageUrl = '/placeholder.svg?text=Ad',
  videoUrl,
  ctaText = 'Más información',
  ctaUrl = '#',
  sponsor = 'Patrocinado',
  className = '',
  closeable = true,
  onClose,
  onClick,
}: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  const handleClick = () => {
    onClick?.()
    if (ctaUrl && ctaUrl !== '#') {
      window.open(ctaUrl, '_blank', 'noopener,noreferrer')
    }
  }

  if (!isVisible) return null

  const sizeClasses = {
    small: 'h-20 sm:h-24',
    medium: 'h-32 sm:h-40',
    large: 'h-48 sm:h-60',
    fullwidth: 'h-24 sm:h-32',
  }

  const containerClasses = {
    banner: 'border border-border/50 bg-gradient-to-r from-muted/30 to-muted/50',
    video: 'border border-border/50 bg-black',
    interactive:
      'border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 transition-all duration-300',
  }

  return (
    <Card
      className={`
      relative overflow-hidden cursor-pointer group
      ${containerClasses[type]}
      ${sizeClasses[size]}
      ${position === 'overlay' ? 'fixed top-4 right-4 z-50 w-80' : 'w-full'}
      ${className}
    `}
    >
      {/* Sponsor Badge */}
      <div className='absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded backdrop-blur-sm z-10'>
        {sponsor}
      </div>

      {/* Close Button */}
      {closeable && (
        <Button
          variant='ghost'
          size='sm'
          onClick={e => {
            e.stopPropagation()
            handleClose()
          }}
          className='absolute top-2 right-2 z-10 h-6 w-6 p-0 bg-black/70 hover:bg-black/90 text-white rounded-full'
          aria-label='Cerrar publicidad'
        >
          <X className='h-3 w-3' />
        </Button>
      )}

      {/* Content */}
      <div className='relative h-full flex items-center' onClick={handleClick}>
        {type === 'video' && videoUrl ? (
          <div className='relative w-full h-full'>
            {!isVideoPlaying ? (
              <div className='relative w-full h-full bg-black flex items-center justify-center'>
                <Image src={imageUrl} alt={title} fill className='object-cover opacity-70' />
                <Button
                  variant='ghost'
                  size='lg'
                  onClick={e => {
                    e.stopPropagation()
                    setIsVideoPlaying(true)
                  }}
                  className='absolute inset-0 text-white hover:bg-white/20'
                  aria-label='Reproducir video publicitario'
                >
                  <Play className='h-12 w-12' />
                </Button>
              </div>
            ) : (
              <video
                src={videoUrl}
                autoPlay
                muted
                className='w-full h-full object-cover'
                onEnded={() => setIsVideoPlaying(false)}
              />
            )}
          </div>
        ) : (
          <div className='flex items-center w-full h-full p-3 sm:p-4'>
            {/* Image */}
            <div className='flex-shrink-0 relative w-16 h-16 sm:w-20 sm:h-20 mr-3 sm:mr-4'>
              <Image src={imageUrl} alt={title} fill className='object-cover rounded-lg' />
              {type === 'interactive' && (
                <div className='absolute inset-0 bg-primary/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                  <ExternalLink className='h-4 w-4 text-primary' />
                </div>
              )}
            </div>

            {/* Text Content */}
            <div className='flex-1 min-w-0'>
              <h3 className='font-semibold text-sm sm:text-base line-clamp-1 mb-1'>{title}</h3>
              <p className='text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2'>
                {description}
              </p>

              {/* CTA Button */}
              <Button
                variant={type === 'interactive' ? 'default' : 'outline'}
                size='sm'
                className='text-xs h-7'
                onClick={e => {
                  e.stopPropagation()
                  handleClick()
                }}
              >
                {ctaText}
                <ExternalLink className='h-3 w-3 ml-1' />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Effects */}
      {type === 'interactive' && (
        <>
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000' />
          <div className='absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300' />
        </>
      )}
    </Card>
  )
}

// Componente para marca de agua interactiva
export function WatermarkAd({
  logoUrl = '/placeholder.svg?text=Logo',
  brandName = 'Marca',
  onClick,
  className = '',
}: {
  logoUrl?: string
  brandName?: string
  onClick?: () => void
  className?: string
}) {
  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50 
        bg-white/90 dark:bg-black/90 backdrop-blur-sm
        rounded-full p-2 cursor-pointer
        hover:scale-110 transition-transform duration-200
        shadow-lg border border-border/50
        ${className}
      `}
      onClick={onClick}
      role='button'
      tabIndex={0}
      aria-label={`Publicidad de ${brandName}`}
    >
      <div className='flex items-center gap-2 px-2'>
        <Image src={logoUrl} alt={brandName} width={24} height={24} className='rounded-full' />
        <span className='text-xs font-medium'>{brandName}</span>
      </div>
    </div>
  )
}

// Componente para banner de página completa
export function FullPageAd({
  imageUrl = '/placeholder.svg?text=Full+Page+Ad',
  title = 'Publicidad Especial',
  description = 'Oferta limitada por tiempo limitado',
  ctaText = 'Aprovechar Oferta',
  ctaUrl = '#',
  onClose,
  duration = 5000,
}: {
  imageUrl?: string
  title?: string
  description?: string
  ctaText?: string
  ctaUrl?: string
  onClose?: () => void
  duration?: number
}) {
  const [isVisible, setIsVisible] = useState(true)
  const [countdown, setCountdown] = useState(duration / 1000)

  // Auto-close después del tiempo especificado
  useState(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearTimeout(timer)
      clearInterval(countdownInterval)
    }
  })

  if (!isVisible) return null

  return (
    <div className='fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4'>
      <Card className='relative max-w-2xl w-full max-h-[90vh] overflow-hidden'>
        {/* Close Button */}
        <Button
          variant='ghost'
          size='sm'
          onClick={() => {
            setIsVisible(false)
            onClose?.()
          }}
          className='absolute top-4 right-4 z-10 h-8 w-8 p-0 bg-black/70 hover:bg-black/90 text-white rounded-full'
          aria-label='Cerrar publicidad'
        >
          <X className='h-4 w-4' />
        </Button>

        {/* Countdown */}
        <div className='absolute top-4 left-4 z-10 px-3 py-1 bg-black/70 text-white text-sm rounded backdrop-blur-sm'>
          Se cierra en {countdown}s
        </div>

        {/* Content */}
        <div className='relative'>
          <Image
            src={imageUrl}
            alt={title}
            width={800}
            height={600}
            className='w-full object-cover'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent' />

          <div className='absolute bottom-0 left-0 right-0 p-6 text-white'>
            <h2 className='text-2xl sm:text-3xl font-bold mb-2'>{title}</h2>
            <p className='text-lg mb-4 text-white/90'>{description}</p>
            <Button
              size='lg'
              className='bg-primary hover:bg-primary/90'
              onClick={() => {
                if (ctaUrl && ctaUrl !== '#') {
                  window.open(ctaUrl, '_blank', 'noopener,noreferrer')
                }
              }}
            >
              {ctaText}
              <ExternalLink className='h-4 w-4 ml-2' />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
