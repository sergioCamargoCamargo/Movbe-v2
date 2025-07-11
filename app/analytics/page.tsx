'use client'

import { Eye, Users, Clock, TrendingUp, Video, Calendar, DollarSign } from 'lucide-react'
import { useState, useEffect } from 'react'

import HeaderDynamic from '@/app/components/HeaderDynamic'
import Sidebar from '@/app/components/Sidebar'
import AccessDenied from '@/components/AccessDenied'
import { PageTransition } from '@/components/PageTransition'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { canViewAnalytics } from '@/lib/auth/permissions'
import { useNavigation } from '@/lib/hooks/useNavigation'
import { AnalyticsService } from '@/lib/services/AnalyticsService'
import { useAppDispatch } from '@/lib/store/hooks'
import { toggleSidebar } from '@/lib/store/slices/sidebarSlice'
import { Analytics, ViewData, TopVideo } from '@/types/analytics'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')
  const dispatch = useAppDispatch()
  const { userProfile, loading } = useAuth()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [viewData, setViewData] = useState<ViewData[]>([])
  const [topVideos, setTopVideos] = useState<TopVideo[]>([])
  const [revenue, setRevenue] = useState<number>(0)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  const { navigateTo } = useNavigation()

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      if (!userProfile?.uid) return

      setAnalyticsLoading(true)
      try {
        const analyticsService = new AnalyticsService()
        const [analyticsData, viewHistory, topVideosData, revenueData] = await Promise.all([
          analyticsService.getUserAnalytics(userProfile.uid),
          analyticsService.getViewData(userProfile.uid, timeRange),
          analyticsService.getTopVideos(userProfile.uid, 5),
          analyticsService.getRevenue(userProfile.uid, timeRange),
        ])

        setAnalytics(analyticsData)
        setViewData(viewHistory)
        setTopVideos(topVideosData)
        setRevenue(revenueData)
      } catch {
        // Error loading analytics data
      } finally {
        setAnalyticsLoading(false)
      }
    }

    loadAnalytics()
  }, [userProfile?.uid, timeRange])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
          <p className='mt-2 text-muted-foreground'>Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Check if user has permission to view analytics
  if (!userProfile || !canViewAnalytics(userProfile.role)) {
    return (
      <AccessDenied
        title='Acceso Restringido'
        message='Las analíticas solo están disponibles para creadores, empresas y administradores. Si eres un creador de contenido, contacta al soporte para actualizar tu cuenta.'
      />
    )
  }

  // Helper functions for data formatting
  const getDailyViews = () => {
    if (viewData.length === 0) return 0
    return viewData[viewData.length - 1]?.views || 0
  }

  const getTotalActiveUsers = () => {
    if (viewData.length === 0) return 0
    return viewData.reduce((sum, day) => sum + day.users, 0)
  }

  const formatWatchTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getChartData = () => {
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    return viewData.slice(-7).map(data => {
      const date = new Date(data.date)
      return {
        day: dayNames[date.getDay()],
        views: data.views,
        users: data.users,
      }
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  return (
    <PageTransition>
      <div className='flex flex-col h-screen'>
        <HeaderDynamic onMenuClick={() => dispatch(toggleSidebar())} />
        <div className='flex flex-1 overflow-hidden pt-16'>
          <Sidebar />
          <div className='flex-1 overflow-auto bg-gradient-to-br from-background via-background to-muted/30 p-2 sm:p-4 md:p-6 lg:p-8'>
            <div className='max-w-7xl mx-auto'>
              {/* Loading State */}
              {analyticsLoading && (
                <div className='flex items-center justify-center py-12'>
                  <div className='text-center'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
                    <p className='mt-2 text-muted-foreground'>Cargando analíticas...</p>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className='mb-6 sm:mb-8'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                  <div>
                    <h1 className='text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent'>
                      Analytics Dashboard
                    </h1>
                    <p className='text-lg text-muted-foreground mt-2'>
                      Métricas y estadísticas de la plataforma
                    </p>
                  </div>

                  <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger className='w-full sm:w-40'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='24h'>Últimas 24h</SelectItem>
                        <SelectItem value='7d'>Últimos 7 días</SelectItem>
                        <SelectItem value='30d'>Últimos 30 días</SelectItem>
                        <SelectItem value='90d'>Últimos 90 días</SelectItem>
                        <SelectItem value='1y'>Último año</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant='outline'
                      className='flex items-center justify-center gap-2 w-full sm:w-auto'
                    >
                      <Calendar className='h-4 w-4' />
                      <span className='sm:inline'>Exportar</span>
                    </Button>
                  </div>
                </div>
              </div>

              {!analyticsLoading && (
                <Tabs defaultValue='overview' className='space-y-6'>
                  <TabsList className='grid w-full grid-cols-4 gap-1 h-auto p-1'>
                    <TabsTrigger value='overview' className='text-xs sm:text-sm'>
                      Resumen
                    </TabsTrigger>
                    <TabsTrigger value='content' className='text-xs sm:text-sm'>
                      Contenido
                    </TabsTrigger>
                    <TabsTrigger value='audience' className='text-xs sm:text-sm'>
                      Audiencia
                    </TabsTrigger>
                    <TabsTrigger value='revenue' className='text-xs sm:text-sm'>
                      Ingresos
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value='overview' className='space-y-6'>
                    {/* Métricas principales */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'>
                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>Vistas Totales</CardTitle>
                          <Eye className='h-4 w-4 text-muted-foreground' />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold'>
                            {formatNumber(analytics?.totalViews || 0)}
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            +{formatNumber(getDailyViews())} hoy
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>Usuarios Activos</CardTitle>
                          <Users className='h-4 w-4 text-muted-foreground' />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold'>
                            {formatNumber(getTotalActiveUsers())}
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            de {formatNumber(analytics?.totalSubscribers || 0)} suscriptores
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>Tiempo Promedio</CardTitle>
                          <Clock className='h-4 w-4 text-muted-foreground' />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold'>
                            {formatWatchTime(analytics?.averageWatchTime || 0)}
                          </div>
                          <p className='text-xs text-muted-foreground'>por sesión</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                          <CardTitle className='text-sm font-medium'>Videos Totales</CardTitle>
                          <Video className='h-4 w-4 text-muted-foreground' />
                        </CardHeader>
                        <CardContent>
                          <div className='text-2xl font-bold'>
                            {formatNumber(analytics?.totalVideos || 0)}
                          </div>
                          <p className='text-xs text-muted-foreground'>+12 esta semana</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Gráfico de tendencias */}
                    <Card>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                          <TrendingUp className='h-5 w-5' />
                          Tendencias de la Semana
                        </CardTitle>
                        <CardDescription>Vistas diarias y usuarios activos</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className='space-y-4'>
                          {getChartData().map((data, _index) => (
                            <div key={data.day} className='flex items-center gap-2 sm:gap-4'>
                              <div className='w-8 sm:w-12 text-xs sm:text-sm font-medium'>
                                {data.day}
                              </div>
                              <div className='flex-1 space-y-2'>
                                <div className='flex items-center gap-1 sm:gap-2'>
                                  <div className='w-12 sm:w-16 text-xs'>Vistas</div>
                                  <div className='flex-1 bg-muted rounded-full h-2'>
                                    <div
                                      className='bg-primary rounded-full h-2 transition-all'
                                      style={{
                                        width: `${Math.min((data.views / Math.max(...getChartData().map(d => d.views), 1)) * 100, 100)}%`,
                                      }}
                                    />
                                  </div>
                                  <div className='w-12 sm:w-16 text-xs text-right'>
                                    {formatNumber(data.views)}
                                  </div>
                                </div>
                                <div className='flex items-center gap-1 sm:gap-2'>
                                  <div className='w-12 sm:w-16 text-xs'>Usuarios</div>
                                  <div className='flex-1 bg-muted rounded-full h-2'>
                                    <div
                                      className='bg-blue-500 rounded-full h-2 transition-all'
                                      style={{
                                        width: `${Math.min((data.users / Math.max(...getChartData().map(d => d.users), 1)) * 100, 100)}%`,
                                      }}
                                    />
                                  </div>
                                  <div className='w-12 sm:w-16 text-xs text-right'>
                                    {formatNumber(data.users)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value='content' className='space-y-6'>
                    <Card>
                      <CardHeader>
                        <CardTitle>Videos Más Populares</CardTitle>
                        <CardDescription>El contenido con mejor rendimiento</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {topVideos.length > 0 ? (
                          <div className='space-y-4'>
                            {topVideos.map((video, index) => (
                              <div
                                key={video.id}
                                className='flex items-start sm:items-center gap-3 sm:gap-4 p-3 bg-muted/30 rounded-lg'
                              >
                                <div className='flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
                                  <span className='text-xs sm:text-sm font-bold text-primary'>
                                    #{index + 1}
                                  </span>
                                </div>
                                <div className='flex-1 min-w-0'>
                                  <h4 className='font-semibold text-sm sm:text-base truncate'>
                                    {video.title}
                                  </h4>
                                  <p className='text-xs sm:text-sm text-muted-foreground'>
                                    Duración: {video.duration}
                                  </p>
                                </div>
                                <div className='text-right flex-shrink-0'>
                                  <p className='font-semibold text-sm sm:text-base'>
                                    {formatNumber(video.views)}
                                  </p>
                                  <p className='text-xs sm:text-sm text-muted-foreground'>vistas</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className='text-center py-8'>
                            <Video className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                            <h3 className='text-lg font-semibold mb-2'>No tienes videos subidos</h3>
                            <p className='text-muted-foreground mb-4'>
                              Sube tu primer video para ver las estadísticas aquí
                            </p>
                            <Button onClick={() => navigateTo('/upload')}>Subir Video</Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value='audience' className='space-y-6'>
                    <Card>
                      <CardHeader>
                        <CardTitle>Demografía por Edad</CardTitle>
                        <CardDescription>
                          Distribución de usuarios por rango de edad
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {analytics?.demographics?.ageGroups &&
                        analytics.demographics.ageGroups.length > 0 ? (
                          <div className='space-y-4'>
                            {analytics.demographics.ageGroups.map((demo, _index) => (
                              <div key={_index} className='flex items-center gap-2 sm:gap-4'>
                                <div className='w-12 sm:w-16 text-xs sm:text-sm font-medium'>
                                  {demo.range}
                                </div>
                                <div className='flex-1 bg-muted rounded-full h-3'>
                                  <div
                                    className='bg-gradient-to-r from-primary to-primary/70 rounded-full h-3 transition-all'
                                    style={{ width: `${demo.percentage}%` }}
                                  />
                                </div>
                                <div className='w-10 sm:w-12 text-xs sm:text-sm text-right'>
                                  {demo.percentage}%
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className='text-center py-8'>
                            <Users className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                            <h3 className='text-lg font-semibold mb-2'>
                              Datos demográficos no disponibles
                            </h3>
                            <p className='text-muted-foreground'>
                              Los datos demográficos se mostrarán cuando tengas más visualizaciones
                              de usuarios registrados
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value='revenue' className='space-y-6'>
                    <Card>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                          <DollarSign className='h-5 w-5' />
                          Ingresos Totales
                        </CardTitle>
                        <CardDescription>Ganancias de publicidad y suscripciones</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className='space-y-6'>
                          <div className='text-center'>
                            <div className='text-2xl sm:text-4xl font-bold text-green-600'>
                              $
                              {revenue.toLocaleString('es-ES', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                            <p className='text-sm sm:text-base text-muted-foreground'>Este mes</p>
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='p-4 bg-green-50 dark:bg-green-950/20 rounded-lg'>
                              <h4 className='font-semibold text-green-700 dark:text-green-400'>
                                Publicidad
                              </h4>
                              <p className='text-2xl font-bold text-green-600'>
                                $
                                {(revenue * 0.7).toLocaleString('es-ES', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </p>
                              <p className='text-sm text-green-600'>70% del total</p>
                            </div>

                            <div className='p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg'>
                              <h4 className='font-semibold text-blue-700 dark:text-blue-400'>
                                Suscripciones
                              </h4>
                              <p className='text-2xl font-bold text-blue-600'>
                                $
                                {(revenue * 0.3).toLocaleString('es-ES', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </p>
                              <p className='text-sm text-blue-600'>30% del total</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
