'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

import { AdBanner } from '@/components/AdBanner'
import { NavigationLink } from '@/components/NavigationLink'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getPublicVideos } from '@/lib/firestore'

interface Video {
  id: string
  title: string
  description: string
  uploaderId: string
  uploaderName: string
  videoURLs: { original: string }
  thumbnailURL: string | null
  viewCount: number
  likeCount: number
  dislikeCount: number
  commentCount: number
  duration: number
  category: string
  tags: string[]
  language: string
  status: string
  visibility: string
  uploadDate: { seconds: number }
  publishedAt: { seconds: number } | null
}

export default function MainContent() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('Todo')

  const categories = [
    'Todo',
    'Música',
    'Videojuegos',
    'Noticias',
    'En vivo',
    'Deportes',
    'Educación',
  ]

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        const fetchedVideos = await getPublicVideos(50)
        setVideos(fetchedVideos)
      } catch {
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

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
              variant={selectedCategory === category ? 'default' : 'secondary'}
              size='sm'
              className='whitespace-nowrap text-xs md:text-sm px-2 md:px-3'
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className='grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-4'>
            {[...Array(12)].map((_, i) => (
              <div key={i} className='space-y-2'>
                <div className='aspect-video bg-muted rounded-lg animate-pulse'></div>
                <div className='h-4 bg-muted rounded animate-pulse'></div>
                <div className='h-3 bg-muted rounded animate-pulse w-3/4'></div>
                <div className='h-3 bg-muted rounded animate-pulse w-1/2'></div>
              </div>
            ))}
          </div>
        ) : (
          <div className='grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-4'>
            {videos.map((video, i) => (
              <div key={video.id} className='space-y-2'>
                {/* Mostrar banner publicitario cada 6 videos */}
                {i > 0 && i % 6 === 0 && (
                  <div className='col-span-full mb-4'>
                    <AdBanner
                      type='banner'
                      size='medium'
                      title={`Producto Patrocinado ${Math.floor(i / 6)}`}
                      description='Descubre ofertas increíbles que no puedes perderte'
                      ctaText='Ver Oferta'
                      sponsor='Patrocinado'
                      imageUrl={`/placeholder.svg?text=Ad+${Math.floor(i / 6)}`}
                    />
                  </div>
                )}

                <NavigationLink href={`/watch/${video.id}`} className='space-y-2 block'>
                  <div className='aspect-video bg-muted rounded-lg overflow-hidden relative group'>
                    <Image
                      src={
                        video.thumbnailURL ||
                        `/placeholder.svg?text=${encodeURIComponent(video.title)}`
                      }
                      alt={video.title}
                      width={320}
                      height={180}
                      className='object-cover w-full h-full'
                    />
                    <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100'>
                      <span className='text-white text-lg font-bold'>Ver video</span>
                    </div>
                  </div>
                  <h3 className='font-semibold text-sm md:text-base line-clamp-2'>{video.title}</h3>
                  <p className='text-xs md:text-sm text-muted-foreground'>{video.uploaderName}</p>
                  <p className='text-xs text-muted-foreground'>
                    {video.viewCount?.toLocaleString() || 0} vistas •{' '}
                    {video.uploadDate
                      ? new Date(video.uploadDate.seconds * 1000).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Fecha desconocida'}
                  </p>
                </NavigationLink>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
