import { PaginatedResponse } from '../api'
import { Video, VideoCategory, FilterOptions, UploadProgress } from '../entities'

export interface IVideoService {
  getVideos(options?: FilterOptions): Promise<PaginatedResponse<Video>>
  getVideoById(id: string): Promise<Video | null>
  getVideosByCreator(creatorId: string, options?: FilterOptions): Promise<PaginatedResponse<Video>>
  getVideosByCategory(
    category: VideoCategory,
    options?: FilterOptions
  ): Promise<PaginatedResponse<Video>>
  uploadVideo(file: File, metadata: VideoUploadMetadata): Promise<UploadProgress>
  updateVideo(id: string, data: Partial<Video>): Promise<Video>
  deleteVideo(id: string): Promise<boolean>
  incrementViewCount(videoId: string): Promise<boolean>
  searchVideos(query: string, options?: FilterOptions): Promise<PaginatedResponse<Video>>
}

export interface VideoUploadMetadata {
  title: string
  description: string
  category: VideoCategory
  tags: string[]
  isPublic: boolean
  thumbnailFile?: File
}
