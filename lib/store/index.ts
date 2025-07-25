import { configureStore } from '@reduxjs/toolkit'

import { createAuthMiddleware } from './authMiddleware'
import authSlice from './slices/authSlice'
import searchSlice from './slices/searchSlice'
import settingsSlice from './slices/settingsSlice'
import sidebarSlice from './slices/sidebarSlice'
import subscriptionSlice from './slices/subscriptionSlice'
import uiSlice from './slices/uiSlice'
import uploadSlice from './slices/uploadSlice'
import videoSlice from './slices/videoSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    search: searchSlice,
    settings: settingsSlice,
    sidebar: sidebarSlice,
    subscription: subscriptionSlice,
    ui: uiSlice,
    upload: uploadSlice,
    video: videoSlice,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'auth/setUser',
          'auth/setUserProfile',
          'auth/refreshUserProfile/fulfilled',
          'upload/setSelectedFile',
          'settings/setUserSettings',
          'video/setHomeVideos',
          'video/setUserVideos',
          'video/setVideo',
          'video/setVideoComments',
          'video/setUserLike',
          'subscription/loadSubscriberCount/fulfilled',
          'subscription/loadSubscriptionState/fulfilled',
          'subscription/toggleSubscription/fulfilled',
        ],
        ignoredActionsPaths: [
          'payload.user',
          'payload.createdAt',
          'payload.lastLoginAt',
          'payload.dateOfBirth',
          'payload',
        ],
        ignoredPaths: [
          'auth.user',
          'auth.userProfile.createdAt',
          'auth.userProfile.lastLoginAt',
          'auth.userProfile.dateOfBirth',
          'upload.selectedFile',
          'settings.userSettings.createdAt',
          'settings.userSettings.lastLoginAt',
          'settings.userSettings.dateOfBirth',
          'video.cache.videos',
          'video.cache.comments',
          'video.cache.likes',
        ],
      },
    }),
})

// Initialize auth middleware after store creation
const authMiddleware = createAuthMiddleware()
authMiddleware(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
