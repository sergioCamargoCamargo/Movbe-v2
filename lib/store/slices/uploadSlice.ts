import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { UploadProgress } from '@/lib/types'

interface UploadFormState {
  title: string
  description: string
  category: string
  selectedFile: File | null
  uploading: boolean
  uploadProgress: UploadProgress | null
}

const initialState: UploadFormState = {
  title: '',
  description: '',
  category: '',
  selectedFile: null,
  uploading: false,
  uploadProgress: null,
}

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    setTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload
    },
    setDescription: (state, action: PayloadAction<string>) => {
      state.description = action.payload
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload
    },
    setSelectedFile: (state, action: PayloadAction<File | null>) => {
      state.selectedFile = action.payload
    },
    setUploading: (state, action: PayloadAction<boolean>) => {
      state.uploading = action.payload
    },
    setUploadProgress: (state, action: PayloadAction<UploadProgress | null>) => {
      state.uploadProgress = action.payload
    },
    resetUploadForm: () => initialState,
  },
})

export const {
  setTitle,
  setDescription,
  setCategory,
  setSelectedFile,
  setUploading,
  setUploadProgress,
  resetUploadForm,
} = uploadSlice.actions

export default uploadSlice.reducer
