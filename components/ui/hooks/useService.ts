import { useCallback, useEffect, useState } from 'react'

import { serviceContainer } from '@/lib/di/ServiceContainer'

export function useService<T>(serviceKey: string): T {
  return serviceContainer.resolve<T>(serviceKey)
}

export function useAsyncService<T, R>(
  serviceKey: string,
  method: string,
  dependencies: unknown[] = []
): {
  data: R | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
} {
  const [data, setData] = useState<R | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const service = useService<T>(serviceKey)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const serviceMethod = (service as Record<string, (...args: unknown[]) => Promise<R>>)[method]
      const result = await serviceMethod.apply(service, dependencies)
      
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [service, method]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}