import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { UserSettings, NotificationSettings, PrivacySettings, DisplaySettings } from '@/lib/types'

interface SettingsState {
  userSettings: UserSettings | null
  loading: boolean
  saving: boolean
  error: string | null
  isGoogleUser: boolean
  // Form state
  displayName: string
  emailNotifications: boolean
  pushNotifications: boolean
  twoFactorEnabled: boolean
  // Password change state
  passwordDialog: boolean
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const initialState: SettingsState = {
  userSettings: null,
  loading: true,
  saving: false,
  error: null,
  isGoogleUser: false,
  // Form state
  displayName: '',
  emailNotifications: true,
  pushNotifications: true,
  twoFactorEnabled: false,
  // Password change state
  passwordDialog: false,
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setUserSettings: (state, action: PayloadAction<UserSettings | null>) => {
      state.userSettings = action.payload
      // Update form state when settings are loaded
      if (action.payload) {
        state.emailNotifications = action.payload.notifications?.email ?? true
        state.pushNotifications = action.payload.notifications?.push ?? true
        state.twoFactorEnabled = action.payload.privacy?.profileVisibility === 'private'
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setSaving: (state, action: PayloadAction<boolean>) => {
      state.saving = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setIsGoogleUser: (state, action: PayloadAction<boolean>) => {
      state.isGoogleUser = action.payload
    },
    // Form state actions
    setDisplayName: (state, action: PayloadAction<string>) => {
      state.displayName = action.payload
    },
    setEmailNotifications: (state, action: PayloadAction<boolean>) => {
      state.emailNotifications = action.payload
    },
    setPushNotifications: (state, action: PayloadAction<boolean>) => {
      state.pushNotifications = action.payload
    },
    setTwoFactorEnabled: (state, action: PayloadAction<boolean>) => {
      state.twoFactorEnabled = action.payload
    },
    // Password dialog actions
    setPasswordDialog: (state, action: PayloadAction<boolean>) => {
      state.passwordDialog = action.payload
      // Clear password fields when dialog is closed
      if (!action.payload) {
        state.currentPassword = ''
        state.newPassword = ''
        state.confirmPassword = ''
      }
    },
    setCurrentPassword: (state, action: PayloadAction<string>) => {
      state.currentPassword = action.payload
    },
    setNewPassword: (state, action: PayloadAction<string>) => {
      state.newPassword = action.payload
    },
    setConfirmPassword: (state, action: PayloadAction<string>) => {
      state.confirmPassword = action.payload
    },
    // Settings update actions
    updateNotificationSettings: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
      if (state.userSettings) {
        state.userSettings.notifications = {
          ...state.userSettings.notifications,
          ...action.payload,
        }
      }
    },
    updatePrivacySettings: (state, action: PayloadAction<Partial<PrivacySettings>>) => {
      if (state.userSettings) {
        state.userSettings.privacy = { ...state.userSettings.privacy, ...action.payload }
      }
    },
    updateDisplaySettings: (state, action: PayloadAction<Partial<DisplaySettings>>) => {
      if (state.userSettings) {
        state.userSettings.display = { ...state.userSettings.display, ...action.payload }
      }
    },
    clearError: state => {
      state.error = null
    },
    resetSettings: () => initialState,
  },
})

export const {
  setUserSettings,
  setLoading,
  setSaving,
  setError,
  setIsGoogleUser,
  setDisplayName,
  setEmailNotifications,
  setPushNotifications,
  setTwoFactorEnabled,
  setPasswordDialog,
  setCurrentPassword,
  setNewPassword,
  setConfirmPassword,
  updateNotificationSettings,
  updatePrivacySettings,
  updateDisplaySettings,
  clearError,
  resetSettings,
} = settingsSlice.actions

export default settingsSlice.reducer
