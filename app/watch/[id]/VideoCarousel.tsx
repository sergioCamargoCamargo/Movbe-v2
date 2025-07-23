'use client'

import { Play, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useRef } from 'react'
import Slider from 'react-slick'

import { NavigationLink } from '@/components/NavigationLink'
import { Button } from '@/components/ui/button'
import { Video } from '@/lib/services/VideoService'

interface VideoCarouselProps {
  videos: Video[]
  onShow?: boolean
}

export default function VideoCarousel({ videos, onShow = true }: VideoCarouselProps) {
  const sliderRef = useRef<Slider>(null)
  // Handle wheel/trackpad scrolling
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      // Horizontal scroll (trackpad)
      if (e.deltaX > 0) {
        sliderRef.current?.slickNext()
      } else {
        sliderRef.current?.slickPrev()
      }
    } else {
      // Vertical scroll converted to horizontal
      if (e.deltaY > 0) {
        sliderRef.current?.slickNext()
      } else {
        sliderRef.current?.slickPrev()
      }
    }
  }

  // Custom arrow components
  const PrevArrow = ({ onClick }: { onClick?: () => void }) => (
    <Button
      variant='ghost'
      size='icon'
      className='absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8'
      onClick={onClick}
    >
      <ChevronLeft className='h-4 w-4' />
    </Button>
  )

  const NextArrow = ({ onClick }: { onClick?: () => void }) => (
    <Button
      variant='ghost'
      size='icon'
      className='absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8'
      onClick={onClick}
    >
      <ChevronRight className='h-4 w-4' />
    </Button>
  )

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 2,
    centerMode: false,
    centerPadding: '0',
    focusOnSelect: false,
    touchMove: true,
    swipeToSlide: true,
    draggable: true,
    useCSS: true,
    useTransform: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          arrows: false,
          draggable: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1.5,
          slidesToScroll: 1,
          centerPadding: '20px',
          arrows: false,
          draggable: true,
        },
      },
    ],
  }

  if (!onShow || videos.length === 0) return null

  return (
    <div className='p-2 sm:p-4'>
      <h3 className='font-bold mb-2 text-sm sm:text-base'>Videos recomendados</h3>
      <div onWheel={handleWheel} className='relative'>
        <Slider
          ref={sliderRef}
          {...sliderSettings}
          className='draggable-carousel cursor-grab active:cursor-grabbing'
        >
          {videos.map(video => (
            <div key={video.id} className='px-1 sm:px-2 carousel-item'>
              <NavigationLink href={`/watch/${video.id}`} className='block'>
                <div className='aspect-video bg-transparent rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 active:scale-95 relative group touch-manipulation'>
                  <Image
                    src={video.thumbnailURL || '/placeholder.svg?text=Video'}
                    alt={video.title}
                    width={320}
                    height={180}
                    className='object-cover w-full h-full'
                  />
                  <div className='absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300'>
                    <div className='bg-black/50 rounded-full p-2'>
                      <Play className='text-white w-6 h-6' />
                    </div>
                  </div>
                </div>
                <p className='text-xs sm:text-sm font-semibold truncate mt-1'>{video.title}</p>
                <p className='text-xs text-muted-foreground'>{video.uploaderName}</p>
              </NavigationLink>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  )
}
