'use client'

import { AlertCircle, CheckCircle, Upload, Video } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import HeaderDynamic from '@/app/components/HeaderDynamic'
import Sidebar from '@/app/components/Sidebar'
import { PageTransition } from '@/components/PageTransition'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { updateVideo } from '@/lib/firestore'
import { useCategories } from '@/lib/hooks/useCategories'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { toggleSidebar } from '@/lib/store/slices/sidebarSlice'
import {
  setCategory,
  setDescription,
  setSelectedFile,
  setTitle,
  setUploading,
  setUploadProgress,
} from '@/lib/store/slices/uploadSlice'
import {
  generateThumbnail,
  uploadThumbnail,
  uploadVideo,
  validateVideoFile,
  UploadProgress as VideoUploadProgress,
} from '@/lib/videoService'

export default function UploadPage() {
  const { t } = useTranslation()
  const { user, userProfile } = useAppSelector(state => state.auth)
  const { title, description, category, selectedFile, uploading, uploadProgress } = useAppSelector(
    state => state.upload
  )
  const { categories: categoriesData, loading: categoriesLoading } = useCategories()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { toast } = useToast()

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const validation = await validateVideoFile(file)
      if (!validation.isValid) {
        toast({
          variant: 'destructive',
          title: t('upload.invalidFile'),
          description: validation.error,
        })
        return
      }
      dispatch(setSelectedFile(file))
    }
  }

  const handleUpload = async () => {
    if (!title || !selectedFile || !category) {
      toast({
        variant: 'destructive',
        title: t('upload.incompleteFields'),
        description: t('upload.incompleteFieldsDescription'),
      })
      return
    }

    if (!user || !userProfile) {
      toast({
        variant: 'destructive',
        title: 'Usuario no autenticado',
        description: 'Debes iniciar sesión para subir videos.',
      })
      return
    }

    dispatch(setUploading(true))
    dispatch(setUploadProgress(null))

    try {
      const videoId = await uploadVideo(
        {
          title,
          description,
          file: selectedFile,
          userId: user.uid,
          userName: userProfile.displayName || user.email || 'Usuario',
          category: category,
          tags: [],
          visibility: 'public',
        },
        (progress: VideoUploadProgress) => {
          // Convert VideoUploadProgress to UploadProgress expected by Redux
          dispatch(
            setUploadProgress({
              videoId: '', // Will be available after upload completes
              progress: progress.progress,
              status: progress.state === 'running' ? 'uploading' : 'completed',
            })
          )
        }
      )

      // Generar y subir thumbnail
      try {
        const thumbnailDataURL = await generateThumbnail(selectedFile)
        const thumbnailURL = await uploadThumbnail(thumbnailDataURL, user.uid, videoId)

        // Actualizar video con thumbnail
        await updateVideo(videoId, { thumbnailURL })
      } catch {
        // Thumbnail generation is optional, continue without it
      }

      toast({
        title: '¡Video subido exitosamente!',
        description: `"${title}" se ha subido correctamente a tu canal.`,
        action: (
          <div className='flex items-center text-green-600'>
            <CheckCircle className='h-4 w-4' />
          </div>
        ),
      })

      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch {
      // Error will be shown in toast
      toast({
        variant: 'destructive',
        title: 'Error al subir el video',
        description: 'Hubo un problema al procesar tu archivo. Por favor, inténtalo de nuevo.',
        action: (
          <div className='flex items-center text-red-600'>
            <AlertCircle className='h-4 w-4' />
          </div>
        ),
      })
    } finally {
      dispatch(setUploading(false))
      dispatch(setUploadProgress(null))
    }
  }

  return (
    <PageTransition>
      <div className='flex flex-col h-screen'>
        <HeaderDynamic onMenuClick={() => dispatch(toggleSidebar())} />
        <div className='flex flex-1 overflow-hidden pt-20'>
          <Sidebar />
          <div className='flex-1 overflow-auto bg-background p-2 sm:p-4 md:h-auto mobile-scroll-container ios-scroll-fix'>
            <div className='max-w-2xl mx-auto px-2 sm:px-0'>
              <div className='mb-4 sm:mb-6'>
                <h1 className='text-2xl sm:text-3xl font-bold mt-2 sm:mt-4'>Subir Video</h1>
                <p className='text-sm sm:text-base text-muted-foreground'>
                  Comparte tu contenido con la comunidad
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Video className='h-5 w-5' />
                    Detalles del Video
                  </CardTitle>
                  <CardDescription>Completa la información de tu video</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4 sm:space-y-6 p-4 sm:p-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='title'>Título del video</Label>
                    <Input
                      id='title'
                      type='text'
                      placeholder='Ingresa el título de tu video'
                      value={title}
                      onChange={e => dispatch(setTitle(e.target.value))}
                      disabled={uploading}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='description'>Descripción (opcional)</Label>
                    <Textarea
                      id='description'
                      placeholder='Describe tu video...'
                      value={description}
                      onChange={e => dispatch(setDescription(e.target.value))}
                      disabled={uploading}
                      rows={3}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='category'>Categoría *</Label>
                    <Select
                      value={category}
                      onValueChange={value => dispatch(setCategory(value))}
                      disabled={uploading || categoriesLoading}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            categoriesLoading
                              ? t('upload.loadingCategories')
                              : t('upload.selectCategory')
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesLoading ? (
                          <SelectItem value='loading' disabled>
                            {t('upload.loadingCategories')}
                          </SelectItem>
                        ) : (
                          categoriesData.map(cat => (
                            <SelectItem key={cat.id} value={cat.name}>
                              {cat.displayName || cat.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='video'>Seleccionar video</Label>
                    <div className='border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 sm:p-6 text-center'>
                      <input
                        id='video'
                        type='file'
                        accept='video/*'
                        onChange={handleFileChange}
                        disabled={uploading}
                        className='hidden'
                      />
                      <label
                        htmlFor='video'
                        className='cursor-pointer flex flex-col items-center space-y-2'
                      >
                        <Upload className='h-8 w-8 text-muted-foreground' />
                        <span className='text-xs sm:text-sm text-muted-foreground block'>
                          {selectedFile ? selectedFile.name : 'Haz clic para seleccionar un video'}
                        </span>
                        <span className='text-xs text-muted-foreground block mt-1'>
                          Formatos soportados: MP4, MOV, AVI, MKV, WebM, HEVC (máx. 500MB, 20 min)
                        </span>
                      </label>
                    </div>
                    {selectedFile && (
                      <div className='text-sm text-muted-foreground'>
                        Tamaño: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    )}
                  </div>

                  {uploadProgress && (
                    <div className='space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <span>Subiendo video...</span>
                        <span>{Math.round(uploadProgress.progress)}%</span>
                      </div>
                      <Progress value={uploadProgress.progress} className='w-full' />
                      <div className='text-xs text-muted-foreground'>
                        Estado: {uploadProgress.status}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleUpload}
                    disabled={!title || !selectedFile || !category || uploading}
                    className='w-full'
                    size='lg'
                  >
                    {uploading ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                        {uploadProgress
                          ? `Subiendo ${Math.round(uploadProgress.progress)}%...`
                          : 'Preparando...'}
                      </>
                    ) : (
                      <>
                        <Upload className='h-4 w-4 mr-2' />
                        Subir Video
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
