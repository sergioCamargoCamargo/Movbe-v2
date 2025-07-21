'use client'

import { Play } from 'lucide-react'
import Image from 'next/image'
import Slider from 'react-slick'

import { NavigationLink } from '@/components/NavigationLink'
import { Video } from '@/lib/firestore'

interface VideoCarouselProps {
  videos: Video[]
  onShow?: boolean
}

export default function VideoCarousel({ videos, onShow = true }: VideoCarouselProps) {
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: '0',
    focusOnSelect: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  }

  if (!onShow || videos.length === 0) return null

  return (
    <div className='absolute top-0 left-0 right-0 bg-background bg-opacity-80 backdrop-blur-sm p-4 transition-opacity duration-300'>
      <h3 className='font-bold mb-2'>Videos recomendados</h3>
      <Slider {...sliderSettings} className='carousel-3d'>
        {videos.map(video => (
          <div key={video.id} className='px-2 carousel-item'>
            <NavigationLink href={`/watch/${video.id}`} className='block'>
              <div className='aspect-video bg-muted rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-110 hover:z-10 relative'>
                <Image
                  src={video.thumbnailURL || '/placeholder.svg?text=Video'}
                  alt={video.title}
                  width={320}
                  height={180}
                  className='object-cover w-full h-full'
                />
                <div className='absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center opacity-0 hover:opacity-100'>
                  <Play className='text-white w-8 h-8' />
                </div>
              </div>
              <p className='text-sm font-semibold truncate mt-1'>{video.title}</p>
              <p className='text-xs text-muted-foreground'>{video.uploaderName}</p>
            </NavigationLink>
          </div>
        ))}
      </Slider>
    </div>
  )
}
