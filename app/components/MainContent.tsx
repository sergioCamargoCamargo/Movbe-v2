'use client'

import { AdBanner } from '@/components/AdBanner'
import { Button } from '@/components/ui/button'
import VideoCard from '@/components/VideoCard'
import { useHomeVideos } from '@/lib/hooks/useVideoData'

export default function MainContent() {
  const { videos, loading, hasAttemptedLoad, refetch } = useHomeVideos()

  const categories = [
    'Todo',
    'Música',
    'Videojuegos',
    'Noticias',
    'En vivo',
    'Deportes',
    'Educación',
  ]

  return (
    <div className='w-full min-w-0'>
      <div className='p-1 xs:p-2 sm:p-4 mobile-container'>
        {/* Banner publicitario principal */}
        <div className='mb-4'>
          <AdBanner
            type='interactive'
            size='fullwidth'
            title='¡Promoción Especial en MOBVE!'
            description='Únete a MOBVE Premium y disfruta de contenido exclusivo sin anuncios'
            ctaText='Suscríbete Ahora'
            sponsor='MOBVE Premium'
            imageUrl='/placeholder.svg?text=MOBVE+Premium'
          />
        </div>

        <div className='categories-container flex space-x-2 pb-4 w-full'>
          {categories.map(category => (
            <Button
              key={category}
              variant='secondary'
              size='sm'
              className='whitespace-nowrap text-xs md:text-sm px-2 py-1.5 md:px-4 md:py-2 touch-manipulation flex-shrink-0 min-w-fit'
            >
              {category}
            </Button>
          ))}
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

        {!loading && videos.length > 0 && (
          <div className='video-grid'>
            {videos
              .map((video, i) => {
                const items = []

                // Insertar banner publicitario cada 4 videos como si fuera un video más
                if (i > 0 && i % 4 === 0) {
                  items.push(
                    <div key={`ad-${Math.floor(i / 4)}`} className='w-full min-w-0'>
                      <div className='transform transition-transform duration-200 hover:scale-105 active:scale-95 w-full'>
                        <AdBanner
                          type='banner'
                          size='medium'
                          title={`Producto Patrocinado ${Math.floor(i / 4)}`}
                          description='Descubre ofertas increíbles que no puedes perderte'
                          ctaText='Ver Oferta'
                          sponsor='Patrocinado'
                          imageUrl={`/placeholder.svg?text=Ad+${Math.floor(i / 4)}`}
                        />
                      </div>
                    </div>
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
