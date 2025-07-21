'use client'

import { TrendingUp } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ViewData } from '@/lib/types/entities/analytics'

interface AnalyticsChartsProps {
  viewData: ViewData[]
}

export default function AnalyticsCharts({ viewData }: AnalyticsChartsProps) {
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
              <div className='w-8 sm:w-12 text-xs sm:text-sm font-medium'>{data.day}</div>
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
                  <div className='w-12 sm:w-16 text-xs text-right'>{formatNumber(data.views)}</div>
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
                  <div className='w-12 sm:w-16 text-xs text-right'>{formatNumber(data.users)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
