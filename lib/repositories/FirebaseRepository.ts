import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  WhereFilterOp,
  setDoc,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'

export interface QueryOptions {
  where?: { field: string; operator: WhereFilterOp; value: unknown }[]
  orderBy?: { field: string; direction: 'asc' | 'desc' }[]
  limit?: number
}

export class FirebaseRepository<T> {
  private collectionName: string

  constructor(collectionName: string) {
    this.collectionName = collectionName
  }

  async findById(id: string): Promise<T | null> {
    try {
      const docRef = doc(db, this.collectionName, id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T
      }

      return null
    } catch (error) {
      // console.error(`Error finding document by id in ${this.collectionName}:`, error)
      throw error
    }
  }

  async findAll(options?: QueryOptions): Promise<T[]> {
    try {
      const collectionRef = collection(db, this.collectionName)
      let q = query(collectionRef)

      if (options?.where) {
        options.where.forEach(condition => {
          q = query(q, where(condition.field, condition.operator, condition.value))
        })
      }

      if (options?.orderBy) {
        options.orderBy.forEach(order => {
          q = query(q, orderBy(order.field, order.direction))
        })
      }

      if (options?.limit) {
        q = query(q, firestoreLimit(options.limit))
      }

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as T[]
    } catch (error) {
      // console.error(`Error finding documents in ${this.collectionName}:`, error)
      throw error
    }
  }

  async create(id: string, data: Omit<T, 'id'>): Promise<string> {
    try {
      const docRef = doc(db, this.collectionName, id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await setDoc(docRef, data as any)
      return id
    } catch (error) {
      // console.error(`Error creating document in ${this.collectionName}:`, error)
      throw error
    }
  }

  async add(data: Omit<T, 'id'>): Promise<string> {
    try {
      const collectionRef = collection(db, this.collectionName)
      const docRef = await addDoc(collectionRef, data)
      return docRef.id
    } catch (error) {
      // console.error(`Error adding document to ${this.collectionName}:`, error)
      throw error
    }
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateDoc(docRef, data as any)
    } catch (error) {
      // console.error(`Error updating document in ${this.collectionName}:`, error)
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id)
      await deleteDoc(docRef)
    } catch (error) {
      // console.error(`Error deleting document from ${this.collectionName}:`, error)
      throw error
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, this.collectionName, id)
      const docSnap = await getDoc(docRef)
      return docSnap.exists()
    } catch {
      // console.error(`Error checking document existence in ${this.collectionName}:`, error)
      return false
    }
  }
}
