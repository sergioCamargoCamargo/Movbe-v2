import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Category } from '@/lib/types/entities/category'

import { CategoryService } from '../services/CategoryService'

export const useCategories = () => {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const categoryService = new CategoryService()
      const categoriesData = await categoryService.getCategories()

      // Agregar traducción a cada categoría usando i18n
      const translatedCategories = categoriesData.map((category: Category) => ({
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
