'use client'

import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal } from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import Slider from 'react-slick'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppDispatch } from '@/lib/store/hooks'
import { toggleSidebar } from '@/lib/store/slices/sidebarSlice'

import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'

export default function WatchPage() {
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [showHeader, setShowHeader] = useState(true)
  const [likes, setLikes] = useState(100000)
  const [dislikes, setDislikes] = useState(1000)
  const [comments, setComments] = useState([
    { id: 1, user: 'Usuario 1', text: 'Este es un comentario de ejemplo. ¡Gran video!', likes: 50 },
    { id: 2, user: 'Usuario 2', text: '¡Excelente contenido!', likes: 30 },
    { id: 3, user: 'Usuario 3', text: 'Me encantó este video, muy informativo.', likes: 20 },
    { id: 4, user: 'Usuario 4', text: '¿Alguien más viendo esto en 2023?', likes: 15 },
    { id: 5, user: 'Usuario 5', text: 'No puedo esperar por la siguiente parte.', likes: 10 },
  ])
  const lastScrollTop = useRef(0)
  const videoRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

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

  const handleLike = () => setLikes(prev => prev + 1)
  const handleDislike = () => setDislikes(prev => prev + 1)
  const handleCommentLike = (id: number) => {
    setComments(prev =>
      prev.map(comment => (comment.id === id ? { ...comment, likes: comment.likes + 1 } : comment))
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
      <Header visible={showHeader} onMenuClick={() => dispatch(toggleSidebar())} />
      <div className='flex flex-1 overflow-hidden pt-16'>
        <Sidebar />
        <ScrollArea className='flex-1'>
          <div className='p-2 sm:p-4 space-y-4'>
            <div className='relative' ref={videoRef}>
              <div className='aspect-video bg-black'>
                <Image
                  src={`/placeholder.svg?text=Video ${id}`}
                  alt={`Video ${id}`}
                  layout='fill'
                  objectFit='contain'
                />
              </div>
              {showRecommendations && (
                <div
                  ref={carouselRef}
                  className='absolute top-0 left-0 right-0 bg-background bg-opacity-80 backdrop-blur-sm p-4 transition-opacity duration-300'
                >
                  <h3 className='font-bold mb-2'>Videos recomendados</h3>
                  <Slider {...sliderSettings} className='carousel-3d'>
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className='px-2 carousel-item'>
                        <div className='aspect-video bg-muted rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-110 hover:z-10'>
                          <Image
                            src={`/placeholder.svg?text=Recomendado ${i + 1}`}
                            alt={`Video recomendado ${i + 1}`}
                            width={320}
                            height={180}
                            className='object-cover'
                          />
                        </div>
                        <p className='text-sm font-semibold truncate mt-1'>
                          Título del video recomendado {i + 1}
                        </p>
                        <p className='text-xs text-muted-foreground'>Nombre del Canal</p>
                      </div>
                    ))}
                  </Slider>
                </div>
              )}
            </div>
            <div className='space-y-4'>
              <h1 className='text-lg sm:text-2xl font-bold'>Título del Video {id}</h1>
              <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
                <div className='flex items-center space-x-2 sm:space-x-4'>
                  <Image
                    src='/placeholder.svg?text=Avatar'
                    alt='Avatar del canal'
                    width={40}
                    height={40}
                    className='rounded-full'
                  />
                  <div className='flex-1'>
                    <p className='font-semibold text-sm sm:text-base'>Nombre del Canal</p>
                    <p className='text-xs sm:text-sm text-muted-foreground'>1M suscriptores</p>
                  </div>
                  <Button size='sm' className='sm:size-default'>
                    Suscribirse
                  </Button>
                </div>
                <div className='flex flex-wrap items-center gap-2'>
                  <Button
                    variant='secondary'
                    onClick={handleLike}
                    size='sm'
                    className='sm:size-default'
                  >
                    <ThumbsUp className='mr-1 sm:mr-2 h-4 w-4' />
                    <span className='hidden xs:inline'>{likes.toLocaleString()}</span>
                  </Button>
                  <Button
                    variant='secondary'
                    onClick={handleDislike}
                    size='sm'
                    className='sm:size-default'
                  >
                    <ThumbsDown className='mr-1 sm:mr-2 h-4 w-4' />
                    <span className='hidden xs:inline'>{dislikes.toLocaleString()}</span>
                  </Button>
                  <Button variant='secondary' size='sm' className='sm:size-default'>
                    <Share2 className='mr-1 sm:mr-2 h-4 w-4' />
                    <span className='hidden sm:inline'>Compartir</span>
                  </Button>
                  <Button variant='secondary' size='sm' className='sm:size-default hidden sm:flex'>
                    <Download className='mr-2 h-4 w-4' /> Descargar
                  </Button>
                  <Button variant='secondary' size='sm' className='sm:size-default'>
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </div>
              </div>
              <div className='bg-muted p-3 sm:p-4 rounded-lg'>
                <p className='text-xs sm:text-sm'>100,000 visualizaciones • hace 1 día</p>
                <p className='mt-2 text-sm sm:text-base'>
                  Descripción del video. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
              <div className='space-y-4'>
                <h2 className='text-lg sm:text-xl font-bold'>Comentarios</h2>
                {comments.map(comment => (
                  <div key={comment.id} className='flex space-x-2 sm:space-x-4'>
                    <Image
                      src='/placeholder.svg?text=User'
                      alt='Avatar del usuario'
                      width={40}
                      height={40}
                      className='rounded-full'
                    />
                    <div className='flex-1'>
                      <p className='font-semibold text-sm sm:text-base'>{comment.user}</p>
                      <p className='text-xs sm:text-sm'>{comment.text}</p>
                      <div className='flex items-center space-x-1 sm:space-x-2 mt-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleCommentLike(comment.id)}
                        >
                          <ThumbsUp className='h-3 w-3 sm:h-4 sm:w-4 mr-1' /> {comment.likes}
                        </Button>
                        <Button variant='ghost' size='sm'>
                          <ThumbsDown className='h-3 w-3 sm:h-4 sm:w-4' />
                        </Button>
                        <Button variant='ghost' size='sm' className='text-xs sm:text-sm'>
                          Responder
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
