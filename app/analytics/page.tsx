'use client'

import { Eye, Users, Clock, TrendingUp, Video, Calendar, DollarSign } from 'lucide-react'
import { useState } from 'react'

import Header from '@/app/components/Header'
import Sidebar from '@/app/components/Sidebar'
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
import { useSidebar } from '@/contexts/SidebarContext'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')
  const { toggleSidebar } = useSidebar()

  // Datos de ejemplo para las métricas
  const metrics = {
    totalViews: 45678,
    dailyViews: 3456,
    totalUsers: 12345,
    activeUsers: 2345,
    avgWatchTime: '8:45',
    totalVideos: 1234,
    revenue: 5678.9,
  }

  const chartData = [
    { day: 'Lun', views: 1200, users: 450 },
    { day: 'Mar', views: 1900, users: 620 },
    { day: 'Mié', views: 2100, users: 580 },
    { day: 'Jue', views: 1800, users: 520 },
    { day: 'Vie', views: 2400, users: 720 },
    { day: 'Sáb', views: 2800, users: 890 },
    { day: 'Dom', views: 2200, users: 680 },
  ]

  const topVideos = [
    { title: 'Video Tutorial #1', views: 5420, duration: '12:34' },
    { title: 'Contenido Destacado', views: 4890, duration: '8:12' },
    { title: 'Review Producto', views: 3567, duration: '15:45' },
    { title: 'Gameplay Épico', views: 3211, duration: '18:22' },
    { title: 'Vlog Personal', views: 2890, duration: '6:33' },
  ]

  const userDemographics = [
    { age: '18-24', percentage: 35 },
    { age: '25-34', percentage: 28 },
    { age: '35-44', percentage: 20 },
    { age: '45-54', percentage: 12 },
    { age: '55+', percentage: 5 },
  ]

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  return (
    <PageTransition>
      <div className='flex flex-col h-screen'>
        <Header onMenuClick={toggleSidebar} />
        <div className='flex flex-1 overflow-hidden pt-16'>
          <Sidebar />
          <div className='flex-1 overflow-auto bg-gradient-to-br from-background via-background to-muted/30 p-2 sm:p-4 md:p-6 lg:p-8'>
            <div className='max-w-7xl mx-auto'>
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

                  <div className='flex items-center gap-3'>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger className='w-40'>
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

                    <Button variant='outline' className='flex items-center gap-2'>
                      <Calendar className='h-4 w-4' />
                      Exportar
                    </Button>
                  </div>
                </div>
              </div>

              <Tabs defaultValue='overview' className='space-y-6'>
                <TabsList className='grid w-full grid-cols-2 md:grid-cols-4'>
                  <TabsTrigger value='overview'>Resumen</TabsTrigger>
                  <TabsTrigger value='content'>Contenido</TabsTrigger>
                  <TabsTrigger value='audience'>Audiencia</TabsTrigger>
                  <TabsTrigger value='revenue'>Ingresos</TabsTrigger>
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
                        <div className='text-2xl font-bold'>{formatNumber(metrics.totalViews)}</div>
                        <p className='text-xs text-muted-foreground'>
                          +{formatNumber(metrics.dailyViews)} hoy
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
                          {formatNumber(metrics.activeUsers)}
                        </div>
                        <p className='text-xs text-muted-foreground'>
                          de {formatNumber(metrics.totalUsers)} totales
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>Tiempo Promedio</CardTitle>
                        <Clock className='h-4 w-4 text-muted-foreground' />
                      </CardHeader>
                      <CardContent>
                        <div className='text-2xl font-bold'>{metrics.avgWatchTime}</div>
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
                          {formatNumber(metrics.totalVideos)}
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
                        {chartData.map((data, _index) => (
                          <div key={data.day} className='flex items-center gap-4'>
                            <div className='w-12 text-sm font-medium'>{data.day}</div>
                            <div className='flex-1 space-y-2'>
                              <div className='flex items-center gap-2'>
                                <div className='w-16 text-xs'>Vistas</div>
                                <div className='flex-1 bg-muted rounded-full h-2'>
                                  <div
                                    className='bg-primary rounded-full h-2 transition-all'
                                    style={{ width: `${(data.views / 3000) * 100}%` }}
                                  />
                                </div>
                                <div className='w-16 text-xs text-right'>
                                  {formatNumber(data.views)}
                                </div>
                              </div>
                              <div className='flex items-center gap-2'>
                                <div className='w-16 text-xs'>Usuarios</div>
                                <div className='flex-1 bg-muted rounded-full h-2'>
                                  <div
                                    className='bg-blue-500 rounded-full h-2 transition-all'
                                    style={{ width: `${(data.users / 1000) * 100}%` }}
                                  />
                                </div>
                                <div className='w-16 text-xs text-right'>
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
                      <div className='space-y-4'>
                        {topVideos.map((video, index) => (
                          <div
                            key={index}
                            className='flex items-center gap-4 p-3 bg-muted/30 rounded-lg'
                          >
                            <div className='flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
                              <span className='text-sm font-bold text-primary'>#{index + 1}</span>
                            </div>
                            <div className='flex-1'>
                              <h4 className='font-semibold'>{video.title}</h4>
                              <p className='text-sm text-muted-foreground'>
                                Duración: {video.duration}
                              </p>
                            </div>
                            <div className='text-right'>
                              <p className='font-semibold'>{formatNumber(video.views)}</p>
                              <p className='text-sm text-muted-foreground'>vistas</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value='audience' className='space-y-6'>
                  <Card>
                    <CardHeader>
                      <CardTitle>Demografía por Edad</CardTitle>
                      <CardDescription>Distribución de usuarios por rango de edad</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-4'>
                        {userDemographics.map((demo, _index) => (
                          <div key={_index} className='flex items-center gap-4'>
                            <div className='w-16 text-sm font-medium'>{demo.age}</div>
                            <div className='flex-1 bg-muted rounded-full h-3'>
                              <div
                                className='bg-gradient-to-r from-primary to-primary/70 rounded-full h-3 transition-all'
                                style={{ width: `${demo.percentage}%` }}
                              />
                            </div>
                            <div className='w-12 text-sm text-right'>{demo.percentage}%</div>
                          </div>
                        ))}
                      </div>
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
                          <div className='text-4xl font-bold text-green-600'>
                            ${metrics.revenue.toLocaleString()}
                          </div>
                          <p className='text-muted-foreground'>Este mes</p>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <div className='p-4 bg-green-50 dark:bg-green-950/20 rounded-lg'>
                            <h4 className='font-semibold text-green-700 dark:text-green-400'>
                              Publicidad
                            </h4>
                            <p className='text-2xl font-bold text-green-600'>
                              ${(metrics.revenue * 0.7).toLocaleString()}
                            </p>
                            <p className='text-sm text-green-600'>70% del total</p>
                          </div>

                          <div className='p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg'>
                            <h4 className='font-semibold text-blue-700 dark:text-blue-400'>
                              Suscripciones
                            </h4>
                            <p className='text-2xl font-bold text-blue-600'>
                              ${(metrics.revenue * 0.3).toLocaleString()}
                            </p>
                            <p className='text-sm text-blue-600'>30% del total</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
