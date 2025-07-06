'use client'

import { AdBanner } from '@/components/AdBanner'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import VideoCard from '@/components/VideoCard'
import { useHomeVideos } from '@/lib/hooks/useVideoData'

export default function MainContent() {
  const { videos, loading, refetch } = useHomeVideos()

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
    <ScrollArea className='flex-1'>
      <div className='p-2 md:p-4'>
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

        <div className='flex space-x-2 pb-4 overflow-x-auto scrollbar-hide'>
          {categories.map(category => (
            <Button
              key={category}
              variant='secondary'
              size='sm'
              className='whitespace-nowrap text-xs md:text-sm px-2 md:px-3'
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

        {!loading && videos.length === 0 && (
          <div className='text-center py-8 text-muted-foreground'>
            <p>No hay videos disponibles</p>
            <Button onClick={refetch} className='mt-4'>
              Reintentar
            </Button>
          </div>
        )}

        {!loading && videos.length > 0 && (
          <div className='grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-4'>
            {videos.map((video, i) => (
              <div key={video.id}>
                {/* Mostrar banner publicitario cada 4 videos */}
                {i > 0 && i % 4 === 0 && (
                  <div className='col-span-full mb-4'>
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
                )}
                <VideoCard video={video} />
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
