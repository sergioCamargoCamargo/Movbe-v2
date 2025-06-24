'use client'

import { useSidebar } from '@/contexts/SidebarContext'

import { HomeSkeleton } from './skeletons/HomeSkeleton'
import { SettingsSkeleton } from './skeletons/SettingsSkeleton'
import { UploadSkeleton } from './skeletons/UploadSkeleton'
import { WatchSkeleton } from './skeletons/WatchSkeleton'

export function PageSkeleton() {
  const { destinationUrl } = useSidebar()
  
  // Usar la URL de destino en lugar de la actual
  const targetPath = destinationUrl || '/'

  // Skeleton específico según la URL de destino
  if (targetPath === '/') {
    return <HomeSkeleton />
  }
  
  if (targetPath === '/upload') {
    return <UploadSkeleton />
  }
  
  if (targetPath === '/settings') {
    return <SettingsSkeleton />
  }
  
  if (targetPath.startsWith('/watch/')) {
    return <WatchSkeleton />
  }
  
  if (targetPath.startsWith('/auth/')) {
    return <HomeSkeleton /> // Para páginas de auth, usar esqueleto simple
  }
  
  // Skeleton genérico para rutas no definidas
  return <HomeSkeleton />
}