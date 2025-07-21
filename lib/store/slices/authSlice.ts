import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { User } from 'firebase/auth'

import { EnhancedUserService } from '@/lib/services/EnhancedUserService'
import { UserProfile } from '@/lib/types/entities/user'

interface AuthState {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  userProfile: null,
  loading: true,
  error: null,
}

const serializeUserProfile = (profile: UserProfile): UserProfile => {
  const toISOString = (timestamp: unknown): string | null => {
    if (!timestamp) return null
    if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
      return (timestamp as { toDate: () => Date }).toDate().toISOString()
    }
    if (timestamp instanceof Date) return timestamp.toISOString()
    if (typeof timestamp === 'string') return timestamp
    return null
  }

  return {
    uid: profile.uid,
    email: profile.email,
    displayName: profile.displayName,
    photoURL: profile.photoURL,
    role: profile.role,
    ageVerified: profile.ageVerified,
    dateOfBirth: toISOString(profile.dateOfBirth),
    createdAt: toISOString(profile.createdAt) || '',
    lastLoginAt: toISOString(profile.lastLoginAt) || '',
    subscriberCount: profile.subscriberCount,
    videoCount: profile.videoCount,
    totalViews: profile.totalViews,
  }
}

export const refreshUserProfile = createAsyncThunk(
  'auth/refreshUserProfile',
  async (user: User) => {
    const userService = new EnhancedUserService()
    const profile = await userService.createOrUpdateUser(user)
    return profile ? (serializeUserProfile(profile) as UserProfile) : null
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
      if (!action.payload) {
        state.userProfile = null
      }
    },
    setUserProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.userProfile = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearError: state => {
      state.error = null
    },
  },
  extraReducers: builder => {
    builder
      .addCase(refreshUserProfile.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(refreshUserProfile.fulfilled, (state, action) => {
        state.loading = false
        state.userProfile = action.payload
        state.error = null
      })
      .addCase(refreshUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to refresh user profile'
      })
  },
})

export const { setUser, setUserProfile, setLoading, setError, clearError } = authSlice.actions
export default authSlice.reducer
