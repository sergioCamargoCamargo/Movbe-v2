'use client'

import { Play } from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import Slider from 'react-slick'

import { NavigationLink } from '@/components/NavigationLink'
import { Button } from '@/components/ui/button'
import { VideoInteractions } from '@/components/VideoInteractions'
import { useAuth } from '@/contexts/AuthContext'
import { Video, getVideoById, getPublicVideos, recordVideoView } from '@/lib/firestore'
import { useAppDispatch } from '@/lib/store/hooks'
import { toggleSidebar } from '@/lib/store/slices/sidebarSlice'

import HeaderDynamic from '../../components/HeaderDynamic'
import Sidebar from '../../components/Sidebar'

export default function WatchPage() {
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const [video, setVideo] = useState<Video | null>(null)
  const [recommendedVideos, setRecommendedVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [showHeader, setShowHeader] = useState(true)
  const lastScrollTop = useRef(0)
  const videoRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id || typeof id !== 'string') return

    const fetchVideo = async () => {
      try {
        setLoading(true)
        setError(null)

        const videoData = await getVideoById(id)
        if (!videoData) {
          setError('Video no encontrado')
          return
        }

        setVideo(videoData)

        // Record view count if user is logged in
        if (user?.uid) {
          await recordVideoView(id, user.uid)
        }

        // Fetch recommended videos
        const recommended = await getPublicVideos(10)
        setRecommendedVideos(recommended.filter(v => v.id !== id))
      } catch {
        setError('Error al cargar el video')
      } finally {
        setLoading(false)
      }
    }

    fetchVideo()
  }, [id, user?.uid])

  useEffect(() => {
    const carousel = carouselRef.current

    const handleScroll = () => {
      const st = window.pageYOffset || document.documentElement.scrollTop
      if (st > lastScrollTop.current) {
        setShowHeader(false)
      } else {
        setShowHeader(true)
      }
      lastScrollTop.current = st <= 0 ? 0 : st
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (videoRef.current) {
        const rect = videoRef.current.getBoundingClientRect()
        setShowRecommendations(e.clientY < rect.top + 200)
      }
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (carousel && !carousel.contains(e.relatedTarget as Node)) {
        setShowRecommendations(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)
    if (carousel) {
      carousel.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
      if (carousel) {
        carousel.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [])

  if (loading) {
    return (
      <div className='flex flex-col min-h-screen'>
        <HeaderDynamic visible={showHeader} onMenuClick={() => dispatch(toggleSidebar())} />
        <div className='flex flex-1 overflow-hidden pt-16'>
          <Sidebar />
          <div className='flex-1 flex items-center justify-center w-full min-w-0 overflow-x-hidden'>
            <p className='text-center'>Cargando video...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !video) {
    return (
      <div className='flex flex-col min-h-screen'>
        <HeaderDynamic visible={showHeader} onMenuClick={() => dispatch(toggleSidebar())} />
        <div className='flex flex-1 overflow-hidden pt-16'>
          <Sidebar />
          <div className='flex-1 flex items-center justify-center w-full min-w-0 overflow-x-hidden'>
            <p className='text-red-600 text-center'>{error || 'Video no encontrado'}</p>
          </div>
        </div>
      </div>
    )
  }

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

  return (
    <div className='flex flex-col min-h-screen'>
      <HeaderDynamic visible={showHeader} onMenuClick={() => dispatch(toggleSidebar())} />
      <div className='flex flex-1 overflow-hidden pt-16'>
        <Sidebar />
        <div className='flex-1 w-full min-w-0 overflow-x-hidden overflow-y-auto'>
          <div className='p-1 xs:p-2 sm:p-4 space-y-4 pb-safe-area-inset-bottom w-full min-w-0 max-w-full'>
            <div className='relative' ref={videoRef}>
              <div className='aspect-video bg-black rounded-lg overflow-hidden'>
                <video
                  src={video.videoURLs.original}
                  poster={video.thumbnailURL}
                  controls
                  className='w-full h-full object-cover touch-manipulation'
                  preload='metadata'
                  playsInline
                  controlsList='nodownload'
                >
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
              {showRecommendations && recommendedVideos.length > 0 && (
                <div
                  ref={carouselRef}
                  className='absolute top-0 left-0 right-0 bg-background bg-opacity-80 backdrop-blur-sm p-4 transition-opacity duration-300'
                >
                  <h3 className='font-bold mb-2'>Videos recomendados</h3>
                  <Slider {...sliderSettings} className='carousel-3d'>
                    {recommendedVideos.map(recVideo => (
                      <div key={recVideo.id} className='px-2 carousel-item'>
                        <NavigationLink href={`/watch/${recVideo.id}`} className='block'>
                          <div className='aspect-video bg-muted rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-110 hover:z-10 relative'>
                            <Image
                              src={recVideo.thumbnailURL || '/placeholder.svg?text=Video'}
                              alt={recVideo.title}
                              width={320}
                              height={180}
                              className='object-cover w-full h-full'
                            />
                            <div className='absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center opacity-0 hover:opacity-100'>
                              <Play className='text-white w-8 h-8' />
                            </div>
                          </div>
                          <p className='text-sm font-semibold truncate mt-1'>{recVideo.title}</p>
                          <p className='text-xs text-muted-foreground'>{recVideo.uploaderName}</p>
                        </NavigationLink>
                      </div>
                    ))}
                  </Slider>
                </div>
              )}
            </div>
            <div className='space-y-4'>
              <h1 className='text-lg sm:text-2xl font-bold'>{video.title}</h1>
              <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4'>
                <div className='flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0'>
                  <Image
                    src='/placeholder.svg?text=Avatar'
                    alt='Avatar del canal'
                    width={40}
                    height={40}
                    className='rounded-full'
                  />
                  <div className='flex-1 min-w-0'>
                    <p className='font-semibold text-sm sm:text-base truncate'>
                      {video.uploaderName}
                    </p>
                    <p className='text-xs sm:text-sm text-muted-foreground'>Canal</p>
                  </div>
                  {user && (
                    <Button size='sm' className='sm:size-default'>
                      Suscribirse
                    </Button>
                  )}
                </div>
                {/* Video interactions moved to dedicated component below */}
              </div>

              <div className='bg-muted p-3 sm:p-4 rounded-lg touch-manipulation'>
                <p className='text-xs sm:text-sm'>
                  {video.viewCount.toLocaleString()} visualizaciones
                </p>
                <p className='mt-2 text-sm sm:text-base'>
                  {video.description || 'Sin descripción'}
                </p>
              </div>

              {/* Video interactions component */}
              <VideoInteractions
                videoId={video.id}
                likes={video.likeCount}
                dislikes={video.dislikeCount}
                isLiked={false}
                isDisliked={false}
                isSaved={false}
                rating={0}
                userRating={0}
                comments={[]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
