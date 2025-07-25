import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

import { getSubscriptionService } from '@/lib/di/serviceRegistration'

interface SubscriptionState {
  subscriberCounts: Record<string, number>
  subscriptionStates: Record<string, boolean>
  loading: Record<string, boolean>
  error: string | null
}

const initialState: SubscriptionState = {
  subscriberCounts: {},
  subscriptionStates: {},
  loading: {},
  error: null,
}

// Async thunk to load subscriber count
export const loadSubscriberCount = createAsyncThunk(
  'subscription/loadSubscriberCount',
  async (userId: string) => {
    const subscriptionService = getSubscriptionService()
    const count = await subscriptionService.getSubscriberCount(userId)
    return { userId, count }
  }
)

// Async thunk to load subscription state
export const loadSubscriptionState = createAsyncThunk(
  'subscription/loadSubscriptionState',
  async ({ channelId, subscriberId }: { channelId: string; subscriberId: string }) => {
    const subscriptionService = getSubscriptionService()
    const relation = await subscriptionService.getSubscriptionRelation(channelId, subscriberId)
    return { channelId, subscriberId, isSubscribed: relation.isSubscribed }
  }
)

// Async thunk to handle subscription
export const toggleSubscription = createAsyncThunk(
  'subscription/toggleSubscription',
  async ({
    channelId,
    subscriberId,
    isSubscribed,
  }: {
    channelId: string
    subscriberId: string
    isSubscribed: boolean
  }) => {
    const subscriptionService = getSubscriptionService()

    if (isSubscribed) {
      await subscriptionService.unsubscribe(channelId, subscriberId)
    } else {
      await subscriptionService.subscribe(channelId, subscriberId)
    }

    return { channelId, subscriberId, isSubscribed: !isSubscribed }
  }
)

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    setSubscriberCount: (state, action: PayloadAction<{ userId: string; count: number }>) => {
      const { userId, count } = action.payload
      state.subscriberCounts[userId] = count
    },
    setSubscriptionState: (
      state,
      action: PayloadAction<{ channelId: string; subscriberId: string; isSubscribed: boolean }>
    ) => {
      const { channelId, subscriberId, isSubscribed } = action.payload
      const key = `${channelId}_${subscriberId}`
      state.subscriptionStates[key] = isSubscribed
    },
    incrementSubscriberCount: (state, action: PayloadAction<string>) => {
      const userId = action.payload
      if (state.subscriberCounts[userId] !== undefined) {
        state.subscriberCounts[userId] += 1
      }
    },
    decrementSubscriberCount: (state, action: PayloadAction<string>) => {
      const userId = action.payload
      if (state.subscriberCounts[userId] !== undefined) {
        state.subscriberCounts[userId] = Math.max(0, state.subscriberCounts[userId] - 1)
      }
    },
    clearError: state => {
      state.error = null
    },
  },
  extraReducers: builder => {
    builder
      // Load subscriber count
      .addCase(loadSubscriberCount.pending, (state, action) => {
        const userId = action.meta.arg
        state.loading[userId] = true
        state.error = null
      })
      .addCase(loadSubscriberCount.fulfilled, (state, action) => {
        const { userId, count } = action.payload
        state.subscriberCounts[userId] = count
        state.loading[userId] = false
      })
      .addCase(loadSubscriberCount.rejected, (state, action) => {
        const userId = action.meta.arg
        state.loading[userId] = false
        state.error = action.error.message || 'Failed to load subscriber count'
      })

      // Load subscription state
      .addCase(loadSubscriptionState.pending, state => {
        state.error = null
      })
      .addCase(loadSubscriptionState.fulfilled, (state, action) => {
        const { channelId, subscriberId, isSubscribed } = action.payload
        const key = `${channelId}_${subscriberId}`
        state.subscriptionStates[key] = isSubscribed
      })
      .addCase(loadSubscriptionState.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to load subscription state'
      })

      // Toggle subscription
      .addCase(toggleSubscription.pending, state => {
        state.error = null
      })
      .addCase(toggleSubscription.fulfilled, (state, action) => {
        const { channelId, subscriberId, isSubscribed } = action.payload
        const key = `${channelId}_${subscriberId}`
        state.subscriptionStates[key] = isSubscribed

        // Update subscriber count
        if (isSubscribed) {
          state.subscriberCounts[channelId] = (state.subscriberCounts[channelId] || 0) + 1
        } else {
          state.subscriberCounts[channelId] = Math.max(
            0,
            (state.subscriberCounts[channelId] || 0) - 1
          )
        }
      })
      .addCase(toggleSubscription.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to toggle subscription'
      })
  },
})

export const {
  setSubscriberCount,
  setSubscriptionState,
  incrementSubscriberCount,
  decrementSubscriberCount,
  clearError,
} = subscriptionSlice.actions

export default subscriptionSlice.reducer
