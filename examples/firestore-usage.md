# Ejemplos de uso de los nuevos servicios de Firebase

## 1. Usar el hook useAuth en componentes

```jsx
'use client'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfileComponent() {
  const { user, userProfile, loading } = useAuth()

  if (loading) return <div>Cargando...</div>

  if (!user) return <div>No autenticado</div>

  return (
    <div>
      <h2>Perfil de Usuario</h2>
      <p>Email: {userProfile?.email}</p>
      <p>Nombre: {userProfile?.displayName || 'Sin nombre'}</p>
      <p>Videos subidos: {userProfile?.videoCount}</p>
      <p>Vistas totales: {userProfile?.totalViews}</p>
      <p>Rol: {userProfile?.role}</p>
    </div>
  )
}
```

## 2. Componente para subir videos

```jsx
'use client'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { VideoService } from '@/lib/services/VideoService'

export default function UploadVideoComponent() {
  const { user, userProfile } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleUpload = async e => {
    e.preventDefault()
    if (!user || !userProfile || !file) return

    setLoading(true)
    try {
      const videoService = new VideoService()

      // Validar archivo
      const validation = await videoService.validateVideoFile(file)
      if (!validation.isValid) {
        alert(validation.error)
        return
      }

      const videoData = {
        title,
        description,
        file,
        userId: user.uid,
        userName: userProfile.displayName || user.email,
        category: 'Otros',
        tags: [],
        visibility: 'public',
      }

      const videoId = await videoService.uploadVideo(videoData, progress => {
        console.log(`Upload progress: ${progress.progress}%`)
      })

      // Limpiar formulario
      setTitle('')
      setDescription('')
      setFile(null)

      alert('Video subido exitosamente!')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al subir video')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleUpload}>
      <div>
        <label>Título:</label>
        <input value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div>
        <label>Descripción:</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div>
        <label>Archivo de video:</label>
        <input type='file' accept='video/*' onChange={e => setFile(e.target.files[0])} required />
      </div>
      <button type='submit' disabled={loading || !file}>
        {loading ? 'Subiendo...' : 'Subir Video'}
      </button>
    </form>
  )
}
```

## 3. Listar videos del usuario

```jsx
'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { VideoService } from '@/lib/services/VideoService'

export default function MyVideosComponent() {
  const { user } = useAuth()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadUserVideos()
    }
  }, [user])

  const loadUserVideos = async () => {
    try {
      const videoService = new VideoService()
      const userVideos = await videoService.getVideosByUser(user.uid)
      setVideos(userVideos)
    } catch (error) {
      console.error('Error loading videos:', error)
    }
    setLoading(false)
  }

  if (loading) return <div>Cargando videos...</div>

  return (
    <div>
      <h2>Mis Videos ({videos.length})</h2>
      {videos.length === 0 ? (
        <p>No has subido videos aún</p>
      ) : (
        <div className='grid grid-cols-3 gap-4'>
          {videos.map(video => (
            <div key={video.id} className='border p-4 rounded'>
              <h3>{video.title}</h3>
              <p>{video.description}</p>
              <div className='text-sm text-gray-500'>
                <p>Vistas: {video.viewCount}</p>
                <p>Estado: {video.status}</p>
                <p>Subido: {video.uploadDate?.toDate?.()?.toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

## 4. Mostrar videos públicos

```jsx
'use client'
import { useState, useEffect } from 'react'
import { VideoService } from '@/lib/services/VideoService'

export default function PublicVideosComponent() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPublicVideos()
  }, [])

  const loadPublicVideos = async () => {
    try {
      const videoService = new VideoService()
      const publicVideos = await videoService.getPublicVideos()
      setVideos(publicVideos)
    } catch (error) {
      console.error('Error loading public videos:', error)
    }
    setLoading(false)
  }

  const handleVideoClick = async video => {
    try {
      const videoService = new VideoService()
      await videoService.recordVideoView(video.id)
      // Actualizar la vista local
      setVideos(prev =>
        prev.map(v => (v.id === video.id ? { ...v, viewCount: v.viewCount + 1 } : v))
      )
    } catch (error) {
      console.error('Error incrementing views:', error)
    }
  }

  if (loading) return <div>Cargando videos...</div>

  return (
    <div>
      <h2>Videos Públicos</h2>
      <div className='grid grid-cols-4 gap-4'>
        {videos.map(video => (
          <div
            key={video.id}
            className='border p-4 rounded cursor-pointer hover:shadow-lg'
            onClick={() => handleVideoClick(video)}
          >
            <h3>{video.title}</h3>
            <p>Por: {video.uploaderName}</p>
            <div className='text-sm text-gray-500'>
              <p>👁 {video.viewCount} vistas</p>
              <p>👍 {video.likeCount} likes</p>
              <p>Categoría: {video.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 5. Actualizar perfil de usuario

```jsx
'use client'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { EnhancedUserService } from '@/lib/services/EnhancedUserService'

export default function EditProfileComponent() {
  const { user, userProfile, refreshUserProfile } = useAuth()
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const userService = new EnhancedUserService()
      const updates = {
        displayName,
        ...(dateOfBirth && {
          dateOfBirth: new Date(dateOfBirth),
          ageVerified: true,
        }),
      }

      await userService.updateUserProfile(user.uid, updates)
      await refreshUserProfile() // Refrescar el perfil en el contexto

      alert('Perfil actualizado!')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar perfil')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nombre a mostrar:</label>
        <input value={displayName} onChange={e => setDisplayName(e.target.value)} />
      </div>
      <div>
        <label>Fecha de nacimiento:</label>
        <input type='date' value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
      </div>
      <button type='submit' disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </form>
  )
}
```

## 6. Buscar videos

```jsx
'use client'
import { useState } from 'react'
import { VideoService } from '@/lib/services/VideoService'

export default function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async e => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setLoading(true)
    try {
      const videoService = new VideoService()
      const videos = await videoService.searchVideos(searchTerm)
      setResults(videos)
    } catch (error) {
      console.error('Error searching:', error)
    }
    setLoading(false)
  }

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type='text'
          placeholder='Buscar videos...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button type='submit' disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {results.length > 0 && (
        <div>
          <h3>Resultados ({results.length}):</h3>
          {results.map(video => (
            <div key={video.id} className='border p-2 mb-2'>
              <h4>{video.title}</h4>
              <p>{video.description}</p>
              <small>Por: {video.uploaderName}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

## 7. Gestionar comentarios

```jsx
'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { CommentService } from '@/lib/services/CommentService'

export default function CommentsComponent({ videoId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadComments()
  }, [videoId])

  const loadComments = async () => {
    try {
      const commentService = new CommentService()
      const videoComments = await commentService.getVideoComments(videoId)
      setComments(videoComments)
    } catch (error) {
      console.error('Error loading comments:', error)
    }
    setLoading(false)
  }

  const handleAddComment = async e => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    try {
      const commentService = new CommentService()
      await commentService.addComment({
        videoId,
        userId: user.uid,
        userName: user.displayName || 'Usuario',
        text: newComment.trim(),
      })

      setNewComment('')
      await loadComments() // Recargar comentarios
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  if (loading) return <div>Cargando comentarios...</div>

  return (
    <div>
      <h3>Comentarios ({comments.length})</h3>

      {user && (
        <form onSubmit={handleAddComment} className='mb-4'>
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder='Escribe un comentario...'
            className='w-full p-2 border rounded'
          />
          <button type='submit' className='mt-2 px-4 py-2 bg-blue-500 text-white rounded'>
            Comentar
          </button>
        </form>
      )}

      <div className='space-y-2'>
        {comments.map(comment => (
          <div key={comment.id} className='border p-3 rounded'>
            <div className='font-bold'>{comment.userName}</div>
            <div>{comment.text}</div>
            <div className='text-sm text-gray-500'>
              {comment.createdAt?.toDate?.()?.toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 7. Proteger rutas con autenticación

```jsx
'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) return <div>Cargando...</div>

  if (!user) return null // Se redirigirá

  return (
    <div>
      <h1>Página Protegida</h1>
      <p>Solo usuarios autenticados pueden ver esto</p>
    </div>
  )
}
```

## Puntos importantes:

1. **El usuario se guarda automáticamente**: Cada vez que alguien se autentica, su información se guarda/actualiza en Firestore automáticamente.

2. **Usa el hook useAuth**: Proporciona acceso tanto al usuario de Firebase Auth como al perfil completo de Firestore.

3. **Manejo de errores**: Siempre envuelve las operaciones de Firestore en try-catch.

4. **Estados de carga**: Usa estados de loading para mejor UX.

5. **Actualización automática**: El contexto se actualiza automáticamente cuando cambia el estado de autenticación.
