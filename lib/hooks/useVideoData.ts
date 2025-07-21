/**
 * Custom hooks optimizados para el manejo de datos de video con Redux
 * Estos hooks encapsulan la lógica de cache, loading states y actualizaciones
 */

import { useCallback, useEffect } from 'react'

import { useAuth } from '@/contexts/AuthContext'
import { Comment, getFallbackTimestamp } from '@/lib/types'

import {
  getVideoComments,
  addCommentToFirestore,
  checkUserVideoLike,
  toggleVideoLikeInDB,
} from '../firestore'
import { VideoService } from '../services/VideoService'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  setHomeVideos,
  setUserVideos,
  setVideo,
  setVideoComments,
  addComment,
  setUserLike,
  updateVideoLikeCount,
  setVideosLoading,
  setCommentsLoading,
  setInteractionLoading,
  selectHomeVideos,
  selectUserVideos,
  selectVideo,
  selectVideoComments,
  selectUserLike,
  selectIsVideosLoading,
  selectIsCommentsLoading,
  selectIsInteractionLoading,
  selectShouldRefreshHomeVideos,
  selectShouldRefreshComments,
  selectShouldRefreshUserVideos,
} from '../store/slices/videoSlice'

/**
 * Hook para manejar los videos de la página principal
 */
export const useHomeVideos = () => {
  const dispatch = useAppDispatch()
  const videos = useAppSelector(selectHomeVideos)
  const loading = useAppSelector(selectIsVideosLoading)
  const shouldRefresh = useAppSelector(selectShouldRefreshHomeVideos)
  const hasAttemptedLoad = useAppSelector(state => state.video.cache.lastFetch.home > 0)

  const fetchHomeVideos = useCallback(
    async (force = false) => {
      if (!force && !shouldRefresh) return

      try {
        dispatch(setVideosLoading(true))
        const videoService = new VideoService()
        const publicVideos = await videoService.getPublicVideos(24)
        dispatch(setHomeVideos(publicVideos))
      } catch {
        // Error handling is managed by the component
      } finally {
        dispatch(setVideosLoading(false))
      }
    },
    [dispatch, shouldRefresh]
  )

  useEffect(() => {
    if (shouldRefresh) {
      fetchHomeVideos()
    }
  }, [shouldRefresh, fetchHomeVideos])

  return {
    videos,
    loading,
    hasAttemptedLoad,
    refetch: () => fetchHomeVideos(true),
  }
}

/**
 * Hook para manejar los videos de un usuario específico
 */
export const useUserVideos = (userId: string) => {
  const dispatch = useAppDispatch()
  const videos = useAppSelector(state => selectUserVideos(state, userId))
  const shouldRefresh = useAppSelector(state => selectShouldRefreshUserVideos(state, userId))

  const fetchUserVideos = useCallback(
    async (force = false) => {
      if (!userId || (!force && !shouldRefresh)) return

      try {
        const videoService = new VideoService()
        const userVideos = await videoService.getVideosByUser(userId)
        dispatch(setUserVideos({ userId, videos: userVideos }))
      } catch {
        // Error handling is managed by the component
      }
    },
    [dispatch, userId, shouldRefresh]
  )

  useEffect(() => {
    if (shouldRefresh) {
      fetchUserVideos()
    }
  }, [shouldRefresh, fetchUserVideos])

  return {
    videos,
    refetch: () => fetchUserVideos(true),
  }
}

/**
 * Hook para manejar un video específico
 */
export const useVideo = (videoId: string) => {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const video = useAppSelector(state => selectVideo(state, videoId))

  const fetchVideo = useCallback(async () => {
    if (!videoId) return

    try {
      const videoService = new VideoService()
      const videoData = await videoService.getVideoById(videoId)
      if (videoData) {
        dispatch(setVideo(videoData))

        // Record view if user is logged in
        if (user?.uid) {
          await videoService.recordVideoView(videoId, user.uid)
        }
      }
    } catch {
      // Error handling is managed by the component
    }
  }, [dispatch, videoId, user?.uid])

  useEffect(() => {
    if (!video && videoId) {
      fetchVideo()
    }
  }, [video, videoId, fetchVideo])

  return {
    video,
    refetch: fetchVideo,
  }
}

/**
 * Hook para manejar comentarios de video
 */
export const useVideoComments = (videoId: string) => {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const comments = useAppSelector(state => selectVideoComments(state, videoId))
  const loading = useAppSelector(state => selectIsCommentsLoading(state, videoId))
  const shouldRefresh = useAppSelector(state => selectShouldRefreshComments(state, videoId))

  const fetchComments = useCallback(
    async (force = false) => {
      if (!videoId) return

      // Only check shouldRefresh if not forced and comments already exist
      if (!force && comments.length > 0 && !shouldRefresh) return

      try {
        dispatch(setCommentsLoading({ videoId, loading: true }))
        const videoComments = await getVideoComments(videoId)
        dispatch(setVideoComments({ videoId, comments: videoComments }))
      } catch {
        // Error handling is managed by the component
      } finally {
        dispatch(setCommentsLoading({ videoId, loading: false }))
      }
    },
    [dispatch, videoId, shouldRefresh, comments.length]
  )

  const addNewComment = useCallback(
    async (text: string) => {
      if (!user?.uid || !videoId || !text.trim()) return

      try {
        const commentId = await addCommentToFirestore({
          videoId,
          userId: user.uid,
          userName: user.displayName || 'Usuario',
          text: text.trim(),
        })

        const newComment: Comment = {
          id: commentId,
          videoId,
          userId: user.uid,
          userName: user.displayName || 'Usuario',
          text: text.trim(),
          createdAt: getFallbackTimestamp(), // Placeholder until Firestore syncs the server timestamp
          likeCount: 0,
          replies: [],
        }

        dispatch(addComment({ videoId, comment: newComment }))
        return true
      } catch {
        // Error handling is managed by the component
        return false
      }
    },
    [dispatch, videoId, user]
  )

  useEffect(() => {
    // Fetch comments on mount or when video changes
    if (videoId && !loading) {
      fetchComments()
    }
  }, [videoId, fetchComments, loading])

  return {
    comments,
    loading,
    addComment: addNewComment,
    refetch: () => fetchComments(true),
  }
}

/**
 * Hook para manejar likes/dislikes de video
 */
export const useVideoLikes = (videoId: string) => {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const video = useAppSelector(state => selectVideo(state, videoId))
  const userLike = useAppSelector(state => selectUserLike(state, videoId, user?.uid || ''))
  const loading = useAppSelector(state => selectIsInteractionLoading(state, videoId))

  const currentLikeCount = video?.likeCount || 0
  const currentDislikeCount = video?.dislikeCount || 0
  const isLiked = userLike?.isLike === true
  const isDisliked = userLike?.isLike === false

  const fetchUserLike = useCallback(async () => {
    if (!user?.uid || !videoId) return

    try {
      const like = await checkUserVideoLike(videoId, user.uid)
      dispatch(setUserLike({ videoId, like, userId: user.uid }))
    } catch {
      // Error handling is managed by the component
    }
  }, [dispatch, videoId, user?.uid])

  const toggleLike = useCallback(
    async (isLike: boolean) => {
      if (!user?.uid || !videoId) return false

      try {
        dispatch(setInteractionLoading({ videoId, loading: true }))

        await toggleVideoLikeInDB(videoId, user.uid, isLike)

        // Update user like status
        const newLike = await checkUserVideoLike(videoId, user.uid)
        dispatch(setUserLike({ videoId, like: newLike, userId: user.uid }))

        // Fetch updated video to get new counts
        const videoService = new VideoService()
        const updatedVideo = await videoService.getVideoById(videoId)
        if (updatedVideo) {
          dispatch(setVideo(updatedVideo))
          dispatch(
            updateVideoLikeCount({
              videoId,
              likeCount: updatedVideo.likeCount,
              dislikeCount: updatedVideo.dislikeCount,
            })
          )
        }

        return true
      } catch {
        // Error handling is managed by the component
        return false
      } finally {
        dispatch(setInteractionLoading({ videoId, loading: false }))
      }
    },
    [dispatch, videoId, user?.uid]
  )

  // Load video data regardless of user login status
  useEffect(() => {
    if (videoId && !video) {
      // Load basic video data to get like/dislike counts
      const videoService = new VideoService()
      videoService
        .getVideoById(videoId)
        .then((videoData: any) => {
          if (videoData) {
            dispatch(setVideo(videoData))
          }
        })
        .catch(() => {
          // Error handled silently
        })
    }
  }, [videoId, video, dispatch])

  // Load user like status only if logged in
  useEffect(() => {
    if (user?.uid && videoId && !userLike) {
      fetchUserLike()
    }
  }, [user?.uid, videoId, userLike, fetchUserLike])

  return {
    likeCount: currentLikeCount,
    dislikeCount: currentDislikeCount,
    isLiked,
    isDisliked,
    loading,
    toggleLike: (isLike: boolean) => toggleLike(isLike),
    refetch: fetchUserLike,
  }
}
