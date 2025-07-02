import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Comment } from '@/types/video'

export class CommentService {
  private readonly commentsCollection = 'comments'
  private readonly videosCollection = 'videos'

  async getCommentsByVideoId(videoId: string): Promise<Comment[]> {
    try {
      const commentsQuery = query(
        collection(db, this.commentsCollection),
        where('videoId', '==', videoId),
        where('parentCommentId', '==', null),
        orderBy('createdAt', 'desc')
      )

      const querySnapshot = await getDocs(commentsQuery)
      
      const comments = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot: QueryDocumentSnapshot<DocumentData>) => {
          const commentData = docSnapshot.data()
          
          // Get replies for this comment
          const repliesQuery = query(
            collection(db, this.commentsCollection),
            where('parentCommentId', '==', docSnapshot.id),
            orderBy('createdAt', 'asc')
          )
          const repliesSnapshot = await getDocs(repliesQuery)
          const replies = repliesSnapshot.docs.map(replyDoc => ({
            id: replyDoc.id,
            ...replyDoc.data(),
            createdAt: replyDoc.data().createdAt?.toDate() || new Date()
          } as Comment))

          return {
            id: docSnapshot.id,
            ...commentData,
            createdAt: commentData.createdAt?.toDate() || new Date(),
            replies
          } as Comment
        })
      )

      return comments
    } catch (error) {
      console.error('Error fetching comments:', error)
      throw new Error('Failed to fetch comments')
    }
  }

  async addComment(
    videoId: string,
    userId: string,
    userName: string,
    text: string,
    parentCommentId?: string
  ): Promise<Comment> {
    try {
      const commentData = {
        videoId,
        userId,
        userName,
        text,
        likeCount: 0,
        createdAt: serverTimestamp(),
        replies: [],
        parentCommentId: parentCommentId || null
      }

      const docRef = await addDoc(collection(db, this.commentsCollection), commentData)
      
      // Update video comment count if this is a top-level comment
      if (!parentCommentId) {
        await updateDoc(doc(db, this.videosCollection, videoId), {
          commentCount: increment(1)
        })
      }

      // Return the comment with the generated ID
      return {
        id: docRef.id,
        videoId,
        userId,
        userName,
        text,
        likeCount: 0,
        createdAt: new Date(),
        replies: [],
        parentCommentId: parentCommentId || undefined
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      throw new Error('Failed to add comment')
    }
  }

  async toggleCommentLike(commentId: string, userId: string): Promise<void> {
    try {
      const commentDoc = await getDoc(doc(db, this.commentsCollection, commentId))
      
      if (!commentDoc.exists()) {
        throw new Error('Comment not found')
      }

      // For simplicity, just increment like count
      // In a real app, you'd track individual user likes
      await updateDoc(doc(db, this.commentsCollection, commentId), {
        likeCount: increment(1)
      })
    } catch (error) {
      console.error('Error toggling comment like:', error)
      throw new Error('Failed to toggle comment like')
    }
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    try {
      const commentDoc = await getDoc(doc(db, this.commentsCollection, commentId))
      
      if (!commentDoc.exists()) {
        throw new Error('Comment not found')
      }

      const commentData = commentDoc.data()
      
      // Check if user owns the comment
      if (commentData.userId !== userId) {
        throw new Error('Unauthorized to delete this comment')
      }

      // In a real implementation, you'd soft delete or actually delete
      // For now, just update the text
      await updateDoc(doc(db, this.commentsCollection, commentId), {
        text: '[Comentario eliminado]',
        deletedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error deleting comment:', error)
      throw new Error('Failed to delete comment')
    }
  }
}
