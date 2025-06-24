import { Skeleton } from '@/components/ui/skeleton'

export function SidebarSkeleton() {
  return (
    <div className='hidden md:block w-64 border-r bg-background h-full'>
      <div className='p-4 space-y-4'>
        {/* Navigation buttons */}
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className='h-10 w-full' />
        ))}

        <div className='my-4 border-t' />

        {/* Categories header */}
        <Skeleton className='h-6 w-24 mx-4' />

        {/* Category buttons */}
        {[...Array(4)].map((_, i) => (
          <Skeleton key={`cat-${i}`} className='h-10 w-full' />
        ))}

        <div className='my-4 border-t' />

        {/* Library header */}
        <Skeleton className='h-6 w-20 mx-4' />

        {/* Library buttons */}
        {[...Array(2)].map((_, i) => (
          <Skeleton key={`lib-${i}`} className='h-10 w-full' />
        ))}
      </div>
    </div>
  )
}
