import { Skeleton } from '@/components/ui/skeleton'

export function HeaderSkeleton() {
  return (
    <header className='fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-background border-b h-16'>
      <div className='flex items-center'>
        <Skeleton className='h-6 w-6 rounded' />
        <Skeleton className='ml-2 md:ml-4 h-8 w-20 md:w-[120px]' />
      </div>
      
      <div className='flex-1 max-w-2xl mx-2 md:mx-4 hidden sm:block'>
        <div className='flex'>
          <Skeleton className='h-10 flex-1 rounded-r-none' />
          <Skeleton className='h-10 w-12 rounded-l-none' />
          <Skeleton className='ml-2 h-10 w-10 hidden md:block' />
        </div>
      </div>
      
      <div className='flex items-center space-x-2 md:space-x-4'>
        <Skeleton className='h-10 w-10 rounded-full hidden md:block' />
        <Skeleton className='h-10 w-10 rounded-full hidden md:block' />
        <Skeleton className='h-10 w-10 rounded-full' />
      </div>
    </header>
  )
}