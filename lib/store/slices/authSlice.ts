import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { User } from 'firebase/auth'

import { createOrUpdateUser } from '@/lib/firestore'
import { UserProfile } from '@/types/user'

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
  const toISOString = (timestamp: any) => {
    if (!timestamp) return timestamp
    if (timestamp.toDate) return timestamp.toDate().toISOString()
    if (timestamp instanceof Date) return timestamp.toISOString()
    return timestamp
  }

  return {
    ...profile,
    createdAt: toISOString(profile.createdAt),
    updatedAt: toISOString(profile.updatedAt),
    lastLoginAt: toISOString(profile.lastLoginAt),
    dateOfBirth: toISOString(profile.dateOfBirth),
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
