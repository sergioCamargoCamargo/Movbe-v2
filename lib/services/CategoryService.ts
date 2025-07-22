import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'

import { db } from '../firebase/config'
import { Category } from '../types/entities/category'

export class CategoryService {
  async getCategories(): Promise<Category[]> {
    try {
      const snapshot = await getDocs(collection(db, 'categories'))
      return snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt
            ? {
                seconds: data.createdAt.seconds,
                nanoseconds: data.createdAt.nanoseconds,
              }
            : { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
          updatedAt: data.updatedAt
            ? {
                seconds: data.updatedAt.seconds,
                nanoseconds: data.updatedAt.nanoseconds,
              }
            : { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
        }
      }) as Category[]
    } catch {
      // Error handling - service will return empty array
      return []
    }
  }

  async initializeCategories(): Promise<void> {
    try {
      const categoriesRef = collection(db, 'categories')
      const snapshot = await getDocs(categoriesRef)

      if (snapshot.empty) {
        const defaultCategories = [
          'Música',
          'Videojuegos',
          'Noticias',
          'Educación',
          'Entretenimiento',
          'Deportes',
          'Tecnología',
          'Cocina',
          'Viajes',
          'Moda',
          'Ciencia',
          'Arte',
          'Comedia',
          'Documentales',
          'Otros',
        ]

        for (const category of defaultCategories) {
          await addDoc(categoriesRef, {
            name: category,
            slug: category.toLowerCase().replace(/\s+/g, '-'),
            description: `Videos de ${category}`,
            isActive: true,
            createdAt: serverTimestamp(),
          })
        }
      }
    } catch {
      // Error handling - initialization will be skipped
    }
  }
}
