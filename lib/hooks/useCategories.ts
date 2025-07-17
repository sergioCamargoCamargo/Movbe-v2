import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Category } from '@/types/category'

import { getCategories } from '../firestore'

export const useCategories = () => {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const categoriesData = await getCategories()

      // Agregar traducción a cada categoría usando i18n
      const translatedCategories = categoriesData.map(category => ({
        ...category,
        displayName: t(`categories.${category.name}`, { defaultValue: category.name }),
      }))

      setCategories(translatedCategories)
    } catch (err) {
      setError(t('common.error'))
      // eslint-disable-next-line no-console
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  }
}
