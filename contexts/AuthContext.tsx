'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { createOrUpdateUser } from '@/lib/firestore'
import { UserProfile } from '@/types/user'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUserProfile = async () => {
    if (user) {
      try {
        const profile = await createOrUpdateUser(user)
        setUserProfile(profile as UserProfile | null)
      } catch (error) {
        console.error('Error refreshing user profile:', error)
      }
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async authUser => {
      setUser(authUser)

      if (authUser) {
        try {
          // Crear o actualizar el perfil del usuario en Firestore automáticamente
          const profile = await createOrUpdateUser(authUser)
          setUserProfile(profile as UserProfile | null)
        } catch (error) {
          console.error('Error creating/updating user profile:', error)
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const value = {
    user,
    userProfile,
    loading,
    refreshUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
