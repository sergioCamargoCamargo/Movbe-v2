import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { User } from 'firebase/auth'

import { createOrUpdateUser } from '@/lib/firestore'

export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  role: string
  ageVerified: boolean
  dateOfBirth: Date | null
  createdAt: Date
  lastLoginAt: Date
  subscriberCount: number
  videoCount: number
  totalViews: number
}

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const serializeUserProfile = (profile: any): UserProfile => {
  return {
    ...profile,
    createdAt: profile.createdAt?.toDate ? profile.createdAt.toDate() : profile.createdAt,
    lastLoginAt: profile.lastLoginAt?.toDate ? profile.lastLoginAt.toDate() : profile.lastLoginAt,
    dateOfBirth: profile.dateOfBirth?.toDate ? profile.dateOfBirth.toDate() : profile.dateOfBirth,
  }
}

export const refreshUserProfile = createAsyncThunk(
  'auth/refreshUserProfile',
  async (user: User) => {
    const profile = await createOrUpdateUser(user)
    return serializeUserProfile(profile) as UserProfile
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
      state.userProfile = action.payload ? serializeUserProfile(action.payload) : null
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
