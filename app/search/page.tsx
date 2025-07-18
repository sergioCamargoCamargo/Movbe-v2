'use client'

import { Clock, Search, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

import HeaderDynamic from '@/components/HeaderDynamic'
import Sidebar from '@/components/Sidebar'
import { Button } from '@/components/ui/button'
import VideoCard from '@/components/VideoCard'
import { useSearch } from '@/lib/hooks/useSearch'
import { useAppDispatch } from '@/lib/store/hooks'
import { toggleSidebar } from '@/lib/store/slices/sidebarSlice'


function SearchContent() {
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const {
    query,
    results,
    loading,
    error,
    hasSearched,
    recentSearches,
    updateQuery,
    searchAndNavigate,
    removeFromRecentSearches,
    clearAllRecentSearches,
    initializeFromUrl,
  } = useSearch()

  const urlQuery = searchParams.get('q') || ''

  useEffect(() => {
    if (urlQuery) {
      initializeFromUrl(urlQuery)
    }
  }, [urlQuery, initializeFromUrl])

  const handleRecentSearch = (recentQuery: string) => {
    updateQuery(recentQuery)
    searchAndNavigate(recentQuery)
  }

  const onMenuClick = () => {
    dispatch(toggleSidebar())
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <HeaderDynamic onMenuClick={onMenuClick} />
      <div className='flex flex-1 pt-20'>
        <Sidebar />
        <div className='flex-1 w-full min-w-0 overflow-x-hidden overflow-y-auto md:h-auto mobile-scroll-container ios-scroll-fix'>
          <div className='p-1 xs:p-2 sm:p-4 space-y-4 pb-safe-area-inset-bottom w-full min-w-0 max-w-full'>
            {/* Búsquedas recientes */}
            {!hasSearched && recentSearches.length > 0 && (
              <div className='max-w-2xl mx-auto'>
                <div className='flex items-center justify-between mb-3'>
                  <h3 className='text-sm font-medium text-muted-foreground'>Búsquedas recientes</h3>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={clearAllRecentSearches}
                    className='text-xs'
                  >
                    Limpiar todo
                  </Button>
                </div>
                <div className='space-y-2'>
                  {recentSearches.map((recentQuery, index) => (
                    <div key={index} className='flex items-center justify-between group'>
                      <button
                        onClick={() => handleRecentSearch(recentQuery)}
                        className='flex items-center gap-2 text-sm hover:text-primary transition-colors flex-1 text-left'
                      >
                        <Clock className='h-4 w-4 text-muted-foreground' />
                        {recentQuery}
                      </button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => removeFromRecentSearches(recentQuery)}
                        className='opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0'
                      >
                        <X className='h-3 w-3' />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estado de carga */}
            {loading && (
              <div className='text-center py-8'>
                <p className='text-muted-foreground'>Buscando videos...</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className='text-center py-8'>
                <p className='text-destructive'>{error}</p>
              </div>
            )}

            {/* Resultados */}
            {hasSearched && !loading && !error && (
              <>
                <div className='max-w-2xl mx-auto'>
                  <p className='text-sm text-muted-foreground'>
                    {results.length > 0
                      ? `${results.length} resultado${results.length === 1 ? '' : 's'} para "${urlQuery || query}"`
                      : `No se encontraron resultados para "${urlQuery || query}"`}
                  </p>
                </div>

                {results.length > 0 && (
                  <div className='video-grid'>
                    {results.map(video => (
                      <div key={video.id} className='w-full min-w-0'>
                        <div className='transform transition-transform duration-200 hover:scale-105 active:scale-95 w-full'>
                          <VideoCard video={video} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {results.length === 0 && (
                  <div className='text-center py-12'>
                    <Search className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                    <p className='text-lg text-muted-foreground mb-2'>No se encontraron videos</p>
                    <p className='text-sm text-muted-foreground'>
                      Intenta con diferentes palabras clave o revisa la ortografía
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Estado inicial */}
            {!hasSearched && !loading && recentSearches.length === 0 && (
              <div className='text-center py-12'>
                <Search className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                <p className='text-lg text-muted-foreground mb-2'>Busca videos en MOVBE</p>
                <p className='text-sm text-muted-foreground'>
                  Escribe algo en la barra de búsqueda para comenzar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className='flex flex-col min-h-screen'>
          <div className='flex-1 flex items-center justify-center'>
            <p>Cargando búsqueda...</p>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
