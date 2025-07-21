import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'

import { Comment, VideoLike, UserLikeStatus } from '@/lib/types'

import { Video } from '../../firestore'

interface VideoUpload {
  id: string
  fileName: string
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  url?: string
  error?: string
}

interface VideoInteraction {
  videoId: string
  liked: boolean
  saved: boolean
  commentCount: number
  likeCount: number
  dislikeCount: number
  viewCount: number
  userLikeStatus: UserLikeStatus
}

interface VideoCache {
  videos: Record<string, Video>
  homeVideos: string[]
  userVideos: Record<string, string[]>
  comments: Record<string, Comment[]>
  likes: Record<string, VideoLike>
  lastFetch: {
    home: number
    comments: Record<string, number>
    userVideos: Record<string, number>
  }
}

interface VideoState {
  uploads: VideoUpload[]
  interactions: Record<string, VideoInteraction>
  cache: VideoCache
  currentVideo: string | null
  isPlaying: boolean
  volume: number
  muted: boolean
  loading: {
    videos: boolean
    comments: Record<string, boolean>
    interactions: Record<string, boolean>
  }
}

const initialState: VideoState = {
  uploads: [],
  interactions: {},
  cache: {
    videos: {},
    homeVideos: [],
    userVideos: {},
    comments: {},
    likes: {},
    lastFetch: {
      home: 0,
      comments: {},
      userVideos: {},
    },
  },
  currentVideo: null,
  isPlaying: false,
  volume: 1,
  muted: false,
  loading: {
    videos: false,
    comments: {},
    interactions: {},
  },
}

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    addUpload: (state, action: PayloadAction<VideoUpload>) => {
      state.uploads.push(action.payload)
    },
    updateUploadProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
      const upload = state.uploads.find(u => u.id === action.payload.id)
      if (upload) {
        upload.progress = action.payload.progress
      }
    },
    updateUploadStatus: (
      state,
      action: PayloadAction<{ id: string; status: VideoUpload['status']; error?: string }>
    ) => {
      const upload = state.uploads.find(u => u.id === action.payload.id)
      if (upload) {
        upload.status = action.payload.status
        if (action.payload.error) {
          upload.error = action.payload.error
        }
      }
    },
    removeUpload: (state, action: PayloadAction<string>) => {
      state.uploads = state.uploads.filter(u => u.id !== action.payload)
    },
    clearUploads: state => {
      state.uploads = []
    },
    // Video Cache Management
    setHomeVideos: (state, action: PayloadAction<Video[]>) => {
      const videos = action.payload
      state.cache.homeVideos = videos.map(v => v.id)
      videos.forEach(video => {
        state.cache.videos[video.id] = video
      })
      state.cache.lastFetch.home = Date.now()
      state.loading.videos = false
    },
    setUserVideos: (state, action: PayloadAction<{ userId: string; videos: Video[] }>) => {
      const { userId, videos } = action.payload
      state.cache.userVideos[userId] = videos.map(v => v.id)
      videos.forEach(video => {
        state.cache.videos[video.id] = video
      })
      state.cache.lastFetch.userVideos[userId] = Date.now()
    },
    setVideo: (state, action: PayloadAction<Video>) => {
      const video = action.payload
      state.cache.videos[video.id] = video
    },

    // Comments Management
    setVideoComments: (state, action: PayloadAction<{ videoId: string; comments: Comment[] }>) => {
      const { videoId, comments } = action.payload
      state.cache.comments[videoId] = comments
      state.cache.lastFetch.comments[videoId] = Date.now()
      state.loading.comments[videoId] = false
    },
    addComment: (state, action: PayloadAction<{ videoId: string; comment: Comment }>) => {
      const { videoId, comment } = action.payload
      if (state.cache.comments[videoId]) {
        state.cache.comments[videoId].unshift(comment)
      }
      // Update video comment count
      if (state.cache.videos[videoId]) {
        state.cache.videos[videoId].commentCount += 1
      }
      // Update interaction
      if (state.interactions[videoId]) {
        state.interactions[videoId].commentCount += 1
      }
    },

    // Like Management
    setUserLike: (
      state,
      action: PayloadAction<{ videoId: string; like: VideoLike | null; userId?: string }>
    ) => {
      const { videoId, like, userId } = action.payload
      const likeKey = `${videoId}_${like?.userId || userId}`
      if (like) {
        state.cache.likes[likeKey] = like
      } else {
        delete state.cache.likes[likeKey]
      }
    },
    updateVideoLikeCount: (
      state,
      action: PayloadAction<{ videoId: string; likeCount: number; dislikeCount: number }>
    ) => {
      const { videoId, likeCount, dislikeCount } = action.payload
      // Update cached video
      if (state.cache.videos[videoId]) {
        state.cache.videos[videoId].likeCount = likeCount
        state.cache.videos[videoId].dislikeCount = dislikeCount
      }
      // Update interaction
      if (state.interactions[videoId]) {
        state.interactions[videoId].likeCount = likeCount
        state.interactions[videoId].dislikeCount = dislikeCount
      }
    },

    // Loading States
    setVideosLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.videos = action.payload
    },
    setCommentsLoading: (state, action: PayloadAction<{ videoId: string; loading: boolean }>) => {
      const { videoId, loading } = action.payload
      state.loading.comments[videoId] = loading
    },
    setInteractionLoading: (
      state,
      action: PayloadAction<{ videoId: string; loading: boolean }>
    ) => {
      const { videoId, loading } = action.payload
      state.loading.interactions[videoId] = loading
    },

    // Legacy interactions (backwards compatibility)
    setVideoInteraction: (state, action: PayloadAction<VideoInteraction>) => {
      state.interactions[action.payload.videoId] = action.payload
    },
    updateVideoInteraction: (
      state,
      action: PayloadAction<{ videoId: string; updates: Partial<VideoInteraction> }>
    ) => {
      const { videoId, updates } = action.payload
      if (state.interactions[videoId]) {
        state.interactions[videoId] = { ...state.interactions[videoId], ...updates }
      } else {
        // Create new interaction if it doesn't exist
        state.interactions[videoId] = {
          videoId,
          liked: false,
          saved: false,
          commentCount: 0,
          likeCount: 0,
          dislikeCount: 0,
          viewCount: 0,
          userLikeStatus: { isLiked: false, isDisliked: false },
          ...updates,
        }
      }
    },
    setCurrentVideo: (state, action: PayloadAction<string | null>) => {
      state.currentVideo = action.payload
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload
    },
    setMuted: (state, action: PayloadAction<boolean>) => {
      state.muted = action.payload
    },
  },
})

export const {
  // Upload actions
  addUpload,
  updateUploadProgress,
  updateUploadStatus,
  removeUpload,
  clearUploads,

  // Video cache actions
  setHomeVideos,
  setUserVideos,
  setVideo,

  // Comment actions
  setVideoComments,
  addComment,

  // Like actions
  setUserLike,
  updateVideoLikeCount,

  // Loading actions
  setVideosLoading,
  setCommentsLoading,
  setInteractionLoading,

  // Legacy interaction actions
  setVideoInteraction,
  updateVideoInteraction,

  // Player actions
  setCurrentVideo,
  setIsPlaying,
  setVolume,
  setMuted,
} = videoSlice.actions

// Selectores optimizados
const selectVideoCache = (state: { video: VideoState }) => state.video.cache
const selectHomeVideoIds = (state: { video: VideoState }) => state.video.cache.homeVideos

export const selectHomeVideos = createSelector(
  [selectVideoCache, selectHomeVideoIds],
  (cache, homeVideoIds) => homeVideoIds.map(id => cache.videos[id]).filter(Boolean)
)

export const selectUserVideos = (state: { video: VideoState }, userId: string) =>
  (state.video.cache.userVideos[userId] || [])
    .map(id => state.video.cache.videos[id])
    .filter(Boolean)

export const selectVideo = (state: { video: VideoState }, videoId: string) =>
  state.video.cache.videos[videoId]

export const selectVideoComments = (state: { video: VideoState }, videoId: string) =>
  state.video.cache.comments[videoId] || []

export const selectUserLike = (state: { video: VideoState }, videoId: string, userId: string) =>
  state.video.cache.likes[`${videoId}_${userId}`]

export const selectVideoInteraction = (state: { video: VideoState }, videoId: string) =>
  state.video.interactions[videoId]

export const selectIsVideosLoading = (state: { video: VideoState }) => state.video.loading.videos

export const selectIsCommentsLoading = (state: { video: VideoState }, videoId: string) =>
  state.video.loading.comments[videoId] || false

export const selectIsInteractionLoading = (state: { video: VideoState }, videoId: string) =>
  state.video.loading.interactions[videoId] || false

// Cache helpers
export const selectShouldRefreshHomeVideos = (
  state: { video: VideoState },
  maxAge = 5 * 60 * 1000
) => {
  const lastFetch = state.video.cache.lastFetch.home
  return !lastFetch || Date.now() - lastFetch > maxAge
}

export const selectShouldRefreshComments = (
  state: { video: VideoState },
  videoId: string,
  maxAge = 2 * 60 * 1000
) => {
  const lastFetch = state.video.cache.lastFetch.comments[videoId]
  return !lastFetch || Date.now() - lastFetch > maxAge
}

export const selectShouldRefreshUserVideos = (
  state: { video: VideoState },
  userId: string,
  maxAge = 10 * 60 * 1000
) => {
  const lastFetch = state.video.cache.lastFetch.userVideos[userId]
  return !lastFetch || Date.now() - lastFetch > maxAge
}

export default videoSlice.reducer
