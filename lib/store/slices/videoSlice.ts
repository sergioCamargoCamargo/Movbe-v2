import { createSlice, PayloadAction } from '@reduxjs/toolkit'

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
  viewCount: number
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
} = videoSlice.actions

export default videoSlice.reducer
