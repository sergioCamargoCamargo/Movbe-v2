'use client'

import { Upload, Video, CheckCircle, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import Header from '@/app/components/Header'
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
import { useAuth } from '@/contexts/AuthContext'
import { useSidebar } from '@/contexts/SidebarContext'
import { useToast } from '@/hooks/use-toast'
import { updateVideo } from '@/lib/firestore'
import {
  uploadVideo,
  validateVideoFile,
  generateThumbnail,
  uploadThumbnail,
  UploadProgress,
} from '@/lib/videoService'

const VIDEO_CATEGORIES = [
  { value: 'entertainment', label: 'Entretenimiento' },
  { value: 'music', label: 'Música' },
  { value: 'news', label: 'Noticias' },
  { value: 'education', label: 'Educación' },
  { value: 'gaming', label: 'Videojuegos' },
  { value: 'sports', label: 'Deportes' },
  { value: 'comedy', label: 'Comedia' },
  { value: 'technology', label: 'Tecnología' },
  { value: 'travel', label: 'Viajes' },
  { value: 'cooking', label: 'Cocina' },
  { value: 'lifestyle', label: 'Estilo de vida' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'art', label: 'Arte' },
  { value: 'science', label: 'Ciencia' },
  { value: 'other', label: 'Otros' },
]

export default function UploadPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { user, userProfile } = useAuth()
  const { toggleSidebar } = useSidebar()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const validation = validateVideoFile(file)
      if (!validation.isValid) {
        toast({
          variant: 'destructive',
          title: 'Archivo no válido',
          description: validation.error,
        })
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!title || !selectedFile || !category) {
      toast({
        variant: 'destructive',
        title: 'Campos incompletos',
        description:
          'Por favor, completa el título, selecciona una categoría y un video antes de continuar.',
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

    setUploading(true)
    setUploadProgress(null)

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
        progress => {
          setUploadProgress(progress)
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
      setUploading(false)
      setUploadProgress(null)
    }
  }

  return (
    <PageTransition>
      <div className='flex flex-col h-screen'>
        <Header onMenuClick={toggleSidebar} />
        <div className='flex flex-1 overflow-hidden pt-16'>
          <Sidebar />
          <div className='flex-1 overflow-auto bg-background p-2 sm:p-4'>
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
                      onChange={e => setTitle(e.target.value)}
                      disabled={uploading}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='description'>Descripción (opcional)</Label>
                    <Textarea
                      id='description'
                      placeholder='Describe tu video...'
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      disabled={uploading}
                      rows={3}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='category'>Categoría *</Label>
                    <Select value={category} onValueChange={setCategory} disabled={uploading}>
                      <SelectTrigger>
                        <SelectValue placeholder='Selecciona una categoría' />
                      </SelectTrigger>
                      <SelectContent>
                        {VIDEO_CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
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
                          Formatos soportados: MP4, MOV, AVI, MKV, WebM (máx. 500MB)
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
                        {(uploadProgress.bytesTransferred / (1024 * 1024)).toFixed(1)} MB de{' '}
                        {(uploadProgress.totalBytes / (1024 * 1024)).toFixed(1)} MB
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
