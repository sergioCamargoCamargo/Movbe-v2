import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Comment } from '@/types/video'

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
  disliked: boolean
  saved: boolean
  subscribed: boolean
  commentCount: number
  likeCount: number
  dislikeCount: number
  viewCount: number
  comments: Comment[]
  loadingComments: boolean
  likeStatus: 'liked' | 'disliked' | null
}

interface VideoState {
  uploads: VideoUpload[]
  interactions: Record<string, VideoInteraction>
  currentVideo: string | null
  isPlaying: boolean
  volume: number
  muted: boolean
}

const initialState: VideoState = {
  uploads: [],
  interactions: {},
  currentVideo: null,
  isPlaying: false,
  volume: 1,
  muted: false,
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
    toggleVideoLike: (state, action: PayloadAction<{ videoId: string; isLike: boolean }>) => {
      const { videoId, isLike } = action.payload
      if (state.interactions[videoId]) {
        if (isLike) {
          state.interactions[videoId].liked = !state.interactions[videoId].liked
          if (state.interactions[videoId].liked) {
            state.interactions[videoId].disliked = false
          }
        } else {
          state.interactions[videoId].disliked = !state.interactions[videoId].disliked
          if (state.interactions[videoId].disliked) {
            state.interactions[videoId].liked = false
          }
        }
      }
    },
    setComments: (state, action: PayloadAction<{ videoId: string; comments: Comment[] }>) => {
      const { videoId, comments } = action.payload
      if (state.interactions[videoId]) {
        state.interactions[videoId].comments = comments
      }
    },
    addComment: (state, action: PayloadAction<{ videoId: string; comment: Comment }>) => {
      const { videoId, comment } = action.payload
      if (state.interactions[videoId]) {
        state.interactions[videoId].comments.unshift(comment)
        state.interactions[videoId].commentCount += 1
      }
    },
    setLoadingComments: (state, action: PayloadAction<{ videoId: string; loading: boolean }>) => {
      const { videoId, loading } = action.payload
      if (state.interactions[videoId]) {
        state.interactions[videoId].loadingComments = loading
      }
    },
    toggleSubscription: (state, action: PayloadAction<{ videoId: string; subscribed: boolean }>) => {
      const { videoId, subscribed } = action.payload
      if (state.interactions[videoId]) {
        state.interactions[videoId].subscribed = subscribed
      }
    },
  },
})

export const {
  addUpload,
  updateUploadProgress,
  updateUploadStatus,
  removeUpload,
  clearUploads,
  setVideoInteraction,
  updateVideoInteraction,
  setCurrentVideo,
  setIsPlaying,
  setVolume,
  setMuted,
  toggleVideoLike,
  setComments,
  addComment,
  setLoadingComments,
  toggleSubscription,
} = videoSlice.actions

export default videoSlice.reducer
