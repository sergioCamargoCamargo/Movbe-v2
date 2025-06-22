import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function MainContent({ isSidebarOpen }: { isSidebarOpen: boolean }) {
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
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : ''} p-4`}>
        <div className='bg-accent rounded-lg p-4 text-center'>
          <h2 className='text-xl font-bold'>Banner de Publicidad</h2>
          <p>Aquí iría tu anuncio o promoción destacada</p>
        </div>

        <div className='flex space-x-2 pb-4 overflow-x-auto'>
          {categories.map(category => (
            <Button key={category} variant='secondary' size='sm'>
              {category}
            </Button>
          ))}
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          {[...Array(12)].map((_, i) => (
            <Link href={`/watch/${i + 1}`} key={i} className='space-y-2 block'>
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
              <h3 className='font-semibold'>Título del Video {i + 1}</h3>
              <p className='text-sm text-muted-foreground'>Nombre del Canal</p>
              <p className='text-xs text-muted-foreground'>1M de vistas • hace 3 días</p>
            </Link>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}
