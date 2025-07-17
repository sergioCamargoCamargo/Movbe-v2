'use client'

import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { AdBanner } from '@/components/AdBanner'
import { Button } from '@/components/ui/button'
import VideoCard from '@/components/VideoCard'
import { useCategories } from '@/lib/hooks/useCategories'
import { useHomeVideos } from '@/lib/hooks/useVideoData'

// Wrapper component para banners en el grid con animaciones suaves
function AdBannerWrapper(props: Parameters<typeof AdBanner>[0]) {
  const [isVisible, setIsVisible] = useState(true)
  const [isClosing, setIsClosing] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)

  // Animación de entrada
  useEffect(() => {
    const timer = setTimeout(() => setHasEntered(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    // Esperar a que termine la animación antes de ocultar completamente
    setTimeout(() => {
      setIsVisible(false)
    }, 300) // Duración de la animación
  }

  if (!isVisible) return null

  return (
    <div
      className={`w-full min-w-0 transition-all duration-300 ease-in-out transform ${
        isClosing
          ? 'opacity-0 scale-95 -translate-y-2 h-0 overflow-hidden'
          : hasEntered
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-2'
      }`}
      style={{
        transitionProperty: 'opacity, transform, height, margin',
      }}
    >
      <div
        className={`transform transition-all duration-200 w-full ${
          !isClosing ? 'hover:scale-105 active:scale-95' : ''
        }`}
      >
        <AdBanner {...props} onClose={handleClose} />
      </div>
    </div>
  )
}

// Wrapper component para el banner principal con animaciones más suaves
function MainAdBannerWrapper(props: Parameters<typeof AdBanner>[0]) {
  const [isVisible, setIsVisible] = useState(true)
  const [isClosing, setIsClosing] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)

  // Animación de entrada más lenta para el banner principal
  useEffect(() => {
    const timer = setTimeout(() => setHasEntered(true), 200)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    // Animación más lenta para el banner principal
    setTimeout(() => {
      setIsVisible(false)
    }, 400)
  }

  if (!isVisible) return null

  return (
    <div
      className={`w-full transition-all duration-400 ease-out transform mb-4 ${
        isClosing
          ? 'opacity-0 scale-98 -translate-y-4 max-h-0 overflow-hidden mb-0'
          : hasEntered
            ? 'opacity-100 scale-100 translate-y-0 max-h-96'
            : 'opacity-0 scale-95 -translate-y-2 max-h-0'
      }`}
      style={{
        transitionProperty: 'opacity, transform, max-height, margin-bottom',
      }}
    >
      <div
        className={`transform transition-all duration-200 ${
          !isClosing ? 'hover:scale-[1.02]' : ''
        }`}
      >
        <AdBanner {...props} onClose={handleClose} />
      </div>
    </div>
  )
}

export default function MainContent() {
  const { t } = useTranslation()
  const { videos, loading, hasAttemptedLoad, refetch } = useHomeVideos()
  const { categories: categoriesData, loading: categoriesLoading } = useCategories()
  const [selectedCategory, setSelectedCategory] = useState<string>('Todo')

  // Combine "Todo" with dynamic categories
  const categories = useMemo(() => {
    return ['Todo', ...categoriesData.map(cat => cat.name)]
  }, [categoriesData])

  // Create display categories with translations
  const displayCategories = useMemo(() => {
    return categories.map(cat => ({
      key: cat,
      displayName: cat === 'Todo' ? t('common.all') : t(`categories.${cat}`, { defaultValue: cat }),
    }))
  }, [categories, t])

  // Filter videos based on selected category using useMemo for performance
  const filteredVideos = useMemo(() => {
    if (selectedCategory === 'Todo') {
      return videos
    }
    return videos.filter(video => video.category === selectedCategory)
  }, [videos, selectedCategory])

  // Get video count per category for display
  const categoryVideoCounts = useMemo(() => {
    const counts: { [key: string]: number } = {}
    videos.forEach(video => {
      counts[video.category] = (counts[video.category] || 0) + 1
    })
    return counts
  }, [videos])

  return (
    <div className='w-full min-w-0'>
      <div className='p-1 xs:p-2 sm:p-4 mobile-container'>
        {/* Banner publicitario principal */}
        <MainAdBannerWrapper
          type='interactive'
          size='fullwidth'
          title='¡Promoción Especial en MOVBE!'
          description='Únete a MOVBE Premium y disfruta de contenido exclusivo sin anuncios'
          ctaText='Suscríbete Ahora'
          sponsor='MOVBE Premium'
          imageUrl='/placeholder.svg?text=MOVBE+Premium'
        />

        <div className='categories-container flex space-x-2 pb-4 w-full overflow-x-auto'>
          {categoriesLoading
            ? // Skeleton for categories loading
              Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className='h-8 w-20 bg-gray-200 rounded-md animate-pulse flex-shrink-0'
                />
              ))
            : displayCategories.map(({ key, displayName }) => {
                const count = key === 'Todo' ? videos.length : categoryVideoCounts[key] || 0
                return (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? 'default' : 'secondary'}
                    size='sm'
                    className='whitespace-nowrap text-xs md:text-sm px-2 py-1.5 md:px-4 md:py-2 touch-manipulation flex-shrink-0 min-w-fit'
                    onClick={() => setSelectedCategory(key)}
                  >
                    {displayName}
                    {count > 0 && <span className='ml-1 text-xs opacity-70'>({count})</span>}
                  </Button>
                )
              })}
        </div>

        {loading && (
          <div className='text-center py-8'>
            <p>Cargando videos...</p>
          </div>
        )}

        {!loading && videos.length === 0 && hasAttemptedLoad && (
          <div className='text-center py-8 text-muted-foreground'>
            <p>No hay videos disponibles</p>
            <Button onClick={refetch} className='mt-4'>
              Reintentar
            </Button>
          </div>
        )}

        {!loading && filteredVideos.length === 0 && videos.length > 0 && (
          <div className='text-center py-8 text-muted-foreground'>
            <p>{t('common.noVideosInCategory', { category: selectedCategory })}</p>
            <Button onClick={() => setSelectedCategory('Todo')} className='mt-4'>
              {t('common.viewAllVideos')}
            </Button>
          </div>
        )}

        {!loading && filteredVideos.length > 0 && (
          <div className='video-grid'>
            {filteredVideos
              .map((video, i) => {
                const items = []

                // Insertar banner publicitario cada 4 videos como si fuera un video más
                if (i > 0 && i % 4 === 0) {
                  items.push(
                    <AdBannerWrapper
                      key={`ad-${Math.floor(i / 4)}`}
                      type='banner'
                      size='medium'
                      title={`Producto Patrocinado ${Math.floor(i / 4)}`}
                      description='Descubre ofertas increíbles que no puedes perderte'
                      ctaText='Ver Oferta'
                      sponsor='Patrocinado'
                      imageUrl={`/placeholder.svg?text=Ad+${Math.floor(i / 4)}`}
                    />
                  )
                }

                // Agregar el video
                items.push(
                  <div key={video.id} className='w-full min-w-0'>
                    <div className='transform transition-transform duration-200 hover:scale-105 active:scale-95 w-full'>
                      <VideoCard video={video} priority={i < 4} />
                    </div>
                  </div>
                )

                return items
              })
              .flat()}
          </div>
        )}
      </div>
    </div>
  )
}
