import Image from 'next/image'

import { AdBanner } from '@/components/AdBanner'
import { NavigationLink } from '@/components/NavigationLink'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function MainContent() {
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

        <div className='grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-4'>
          {[...Array(12)].map((_, i) => (
            <div key={i} className='space-y-2'>
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

              <NavigationLink href={`/watch/${i + 1}`} className='space-y-2 block'>
                <div className='aspect-video bg-muted rounded-lg overflow-hidden relative group'>
                  <Image
                    src={`/placeholder.svg?text=Video ${i + 1}`}
                    alt={`Video ${i + 1}`}
                    width={320}
                    height={180}
                    className='object-cover w-full h-full'
                  />
                  <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100'>
                    <span className='text-white text-lg font-bold'>Ver video</span>
                  </div>
                </div>
                <h3 className='font-semibold text-sm md:text-base line-clamp-2'>
                  Título del Video {i + 1}
                </h3>
                <p className='text-xs md:text-sm text-muted-foreground'>Nombre del Canal</p>
                <p className='text-xs text-muted-foreground'>1M de vistas • hace 3 días</p>
              </NavigationLink>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}
