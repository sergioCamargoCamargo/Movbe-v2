'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AdBanner } from '@/components/AdBanner'
import { Button } from '@/components/ui/button'
import VideoCard from '@/components/VideoCard'
import { Video } from '@/lib/services/VideoService'
import { Category } from '@/lib/types/entities/category'

interface MainContentClientProps {
  initialVideos: Video[]
  categories: Category[]
}

function AdBannerWrapper(props: Parameters<typeof AdBanner>[0]) {
  const [isVisible, setIsVisible] = useState(true)
  const [isClosing, setIsClosing] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setHasEntered(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
    }, 300)
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

function MainAdBannerWrapper(props: Parameters<typeof AdBanner>[0]) {
  const [isVisible, setIsVisible] = useState(true)
  const [isClosing, setIsClosing] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setHasEntered(true), 200)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsClosing(true)
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

export default function MainContentClient({ initialVideos, categories }: MainContentClientProps) {
  const { t } = useTranslation()
  const [videos] = useState<Video[]>(initialVideos)
  const [selectedCategory, setSelectedCategory] = useState<string>('Todo')
  const [loading, setLoading] = useState(false)

  const categoryOptions = useMemo(() => {
    if (categories.length === 0) {
      return ['Todo']
    }
    return ['Todo', ...categories.map(cat => cat.name)]
  }, [categories])

  const displayCategories = useMemo(() => {
    return categoryOptions.map(cat => ({
      key: cat,
      displayName: cat === 'Todo' ? t('common.all') : t(`categories.${cat}`, { defaultValue: cat }),
    }))
  }, [categoryOptions, t])

  const filteredVideos = useMemo(() => {
    if (selectedCategory === 'Todo') {
      return videos
    }
    return videos.filter(video => video.category === selectedCategory)
  }, [videos, selectedCategory])

  const categoryVideoCounts = useMemo(() => {
    const counts: { [key: string]: number } = {}

    categories.forEach(category => {
      counts[category.name] = category.count || 0
    })

    videos.forEach(video => {
      if (video.category) {
        counts[video.category] = (counts[video.category] || 0) + 1
      }
    })

    return counts
  }, [videos, categories])

  const refetch = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  return (
    <div className='w-full min-w-0'>
      <div className='p-1 xs:p-2 sm:p-4 mobile-container'>
        <MainAdBannerWrapper
          type='interactive'
          size='fullwidth'
          title={t('ads.defaultTitle')}
          description={t('ads.defaultDescription')}
          ctaText={t('ads.defaultCta')}
          sponsor={t('ads.sponsor')}
          imageUrl='/placeholder.svg?text=MOVBE+Premium'
        />

        <div className='categories-container flex space-x-2 pb-4 w-full overflow-x-auto'>
          {displayCategories.length === 0 ? (
            <div className='flex space-x-2'>
              {[...Array(6)].map((_, i) => (
                <div key={i} className='h-8 w-20 bg-muted animate-pulse rounded-md flex-shrink-0' />
              ))}
            </div>
          ) : (
            displayCategories.map(({ key, displayName }) => {
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
            })
          )}
        </div>

        {loading && (
          <div className='text-center py-8'>
            <p>{t('home.loadingVideos')}</p>
          </div>
        )}

        {!loading && videos.length === 0 && (
          <div className='text-center py-8 text-muted-foreground'>
            <p>{t('home.noVideos')}</p>
            <Button onClick={refetch} className='mt-4'>
              {t('common.goHome')}
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
          <div className='space-y-8'>
            {filteredVideos.length > 0 && (
              <div className='hero-section hidden md:block'>
                <div className='hero-grid'>
                  <div className='featured-video'>
                    <div className='transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] h-full'>
                      <VideoCard video={filteredVideos[0]} priority={true} featured={true} />
                    </div>
                  </div>

                  {filteredVideos.length > 1 && (
                    <div className='secondary-videos'>
                      {filteredVideos.slice(1, 5).map((video, i) => (
                        <div key={video.id} className='w-full h-full'>
                          <div className='transform transition-transform duration-200 hover:scale-105 active:scale-95 h-full'>
                            <VideoCard video={video} priority={i < 2} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className='video-grid'>
              {filteredVideos
                .slice(0)
                .map((video, i) => {
                  const items = []
                  const actualIndex = i
                  const desktopIndex = i >= 5 ? i : -1

                  if (desktopIndex > 5 && (desktopIndex - 5) % 4 === 0) {
                    items.push(
                      <div
                        key={`ad-${Math.floor((desktopIndex - 5) / 4)}`}
                        className='hidden md:block w-full min-w-0'
                      >
                        <AdBannerWrapper
                          type='banner'
                          size='medium'
                          title={t('ads.defaultTitle')}
                          description={t('ads.defaultDescription')}
                          ctaText={t('ads.defaultCta')}
                          sponsor={t('ads.sponsor')}
                          imageUrl={`/placeholder.svg?text=Ad+${Math.floor((desktopIndex - 5) / 4)}`}
                        />
                      </div>
                    )
                  }

                  if (actualIndex > 0 && actualIndex % 4 === 0) {
                    items.push(
                      <div
                        key={`mobile-ad-${Math.floor(actualIndex / 4)}`}
                        className='md:hidden w-full min-w-0'
                      >
                        <AdBannerWrapper
                          type='banner'
                          size='medium'
                          title={t('ads.defaultTitle')}
                          description={t('ads.defaultDescription')}
                          ctaText={t('ads.defaultCta')}
                          sponsor={t('ads.sponsor')}
                          imageUrl={`/placeholder.svg?text=Ad+${Math.floor(actualIndex / 4)}`}
                        />
                      </div>
                    )
                  }

                  items.push(
                    <div key={video.id} className={`w-full min-w-0 ${i < 5 ? 'md:hidden' : ''}`}>
                      <div className='transform transition-transform duration-200 hover:scale-105 active:scale-95 w-full'>
                        <VideoCard video={video} priority={i < 4} />
                      </div>
                    </div>
                  )

                  return items
                })
                .flat()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
