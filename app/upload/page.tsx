'use client'

import { Upload, Video, CheckCircle, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import Header from '@/app/components/Header'
import Sidebar from '@/app/components/Sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export default function UploadPage() {
  const [title, setTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!title || !selectedFile) {
      toast({
        variant: 'destructive',
        title: 'Campos incompletos',
        description: 'Por favor, completa el título y selecciona un video antes de continuar.',
      })
      return
    }

    setUploading(true)

    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000))

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
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error uploading video:', error)
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
    }
  }

  return (
    <div className='flex flex-col h-screen'>
      <Header onMenuClick={toggleSidebar} />
      <div className='flex flex-1 overflow-hidden pt-16'>
        <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
        <div className='flex-1 overflow-auto bg-background p-4'>
          <div className='max-w-2xl mx-auto'>
            <div className='mb-6'>
              <h1 className='text-3xl font-bold mt-4'>Subir Video</h1>
              <p className='text-muted-foreground'>Comparte tu contenido con la comunidad</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Video className='h-5 w-5' />
                  Detalles del Video
                </CardTitle>
                <CardDescription>Completa la información de tu video</CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
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
                  <Label htmlFor='video'>Seleccionar video</Label>
                  <div className='border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center'>
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
                      <span className='text-sm text-muted-foreground'>
                        {selectedFile ? selectedFile.name : 'Haz clic para seleccionar un video'}
                      </span>
                      <span className='text-xs text-muted-foreground'>
                        Formatos soportados: MP4, MOV, AVI, MKV
                      </span>
                    </label>
                  </div>
                  {selectedFile && (
                    <div className='text-sm text-muted-foreground'>
                      Tamaño: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={!title || !selectedFile || uploading}
                  className='w-full'
                  size='lg'
                >
                  {uploading ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                      Subiendo...
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
  )
}
