# Google Analytics 4 Implementation Guide

## Overview

Se ha implementado Google Analytics 4 (GA4) en toda la plataforma MOVBE para realizar un seguimiento completo de las interacciones de los usuarios.

## Configuración

### 1. Variables de Entorno

Agregue su ID de Google Analytics en el archivo `.env.local`:

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 2. Archivos Principales

- `lib/analytics/google-analytics.ts` - Funciones de tracking de GA4
- `components/GoogleAnalytics.tsx` - Componente para cargar los scripts de GA4
- `lib/hooks/useAnalytics.ts` - Hook personalizado para facilitar el tracking

## Eventos Implementados

### Páginas con Tracking

- ✅ **Home Page** - Página principal con conteo de videos
- ✅ **Watch Page** - Página de reproducción de videos
- ✅ **Search Page** - Página de búsqueda con términos y resultados
- ✅ **Login Page** - Página de inicio de sesión
- ✅ **Upload Page** - Página de subida de videos

### Eventos de Video

- ✅ **Video Play** - Cuando el usuario reproduce un video
- ✅ **Video Pause** - Cuando el usuario pausa un video
- ✅ **Video Ended** - Cuando el video termina de reproducirse
- ✅ **Video Seek** - Cuando el usuario navega en el timeline del video
- ✅ **Video View** - Cuando se carga una página de video

### Interacciones de Usuario

- ✅ **Like/Unlike** - Me gusta en videos
- ✅ **Dislike/Undislike** - No me gusta en videos
- ✅ **Save/Unsave** - Guardar videos
- ✅ **Share** - Compartir videos
- ✅ **Subscribe/Unsubscribe** - Suscribirse a canales
- ✅ **Rate Video** - Calificar videos con estrellas
- ✅ **Add Comment** - Agregar comentarios

### Autenticación

- ✅ **Login** - Inicio de sesión (email y Google)
- ✅ **Register** - Registro de nuevos usuarios
- ✅ **Logout** - Cierre de sesión

### Búsqueda

- ✅ **Search Query** - Términos de búsqueda y cantidad de resultados
- ✅ **Recent Search Click** - Clicks en búsquedas recientes

### Upload de Videos

- ✅ **File Selection** - Selección de archivos de video
- ✅ **Upload Start** - Inicio de subida
- ✅ **Upload Complete** - Subida exitosa
- ✅ **Upload Error** - Errores en la subida

### Errores y Problemas

- ✅ **Authentication Errors** - Errores de autenticación
- ✅ **Upload Errors** - Errores en subidas
- ✅ **Video Interaction Errors** - Errores en interacciones
- ✅ **Age Verification Issues** - Problemas de verificación de edad

## Estructura de Eventos

### Eventos Personalizados

```javascript
// Ejemplo de evento de video
trackVideoEvent('play', videoId, duration, currentTime)

// Ejemplo de evento de interacción
trackUserInteraction('click', 'like_button', { videoId, isLiked })

// Ejemplo de evento de autenticación
trackAuthEvent('login', 'google')

// Ejemplo de evento de búsqueda
trackSearchEvent('search_term', resultCount)
```

### Categorías de Eventos

- **Video** - Interacciones relacionadas con reproducción de videos
- **Video Engagement** - Likes, comentarios, calificaciones
- **User Interaction** - Clicks, interacciones generales
- **Authentication** - Login, registro, logout
- **Search** - Búsquedas y navegación
- **Upload** - Subida de contenido
- **Subscription** - Suscripciones a canales
- **Social** - Compartir contenido
- **Performance** - Métricas de rendimiento
- **Error** - Errores y problemas

## Métricas Clave

### Engagement de Videos

- Reproducciones totales
- Tiempo de visualización
- Tasas de finalización
- Interacciones (likes, comentarios, shares)
- Calificaciones promedio

### Comportamiento de Usuario

- Páginas más visitadas
- Flujos de navegación
- Tasas de conversión (registro, login)
- Patrones de búsqueda

### Rendimiento de Contenido

- Videos más populares
- Categorías más vistas
- Tasas de engagement por creador
- Rendimiento de uploads

## Verificación

### En Desarrollo

1. Abrir Chrome DevTools
2. Ir a la pestaña Network
3. Filtrar por "google-analytics" o "gtag"
4. Realizar acciones en la app
5. Verificar que se envían requests a GA4

### En Google Analytics

1. Ir a Google Analytics 4
2. Navegar a "Realtime" → "Overview"
3. Realizar acciones en la app
4. Verificar que aparezcan eventos en tiempo real

### Eventos Específicos

1. En GA4, ir a "Realtime" → "Event count by Event name"
2. Verificar eventos como:
   - `page_view`
   - `video_play`
   - `video_pause`
   - `like`
   - `search`
   - `login`
   - `video_uploaded`

## Próximos Pasos

### Mejoras Recomendadas

1. **Implementar Enhanced Ecommerce** - Para tracking de monetización
2. **Agregar User Properties** - Para segmentación avanzada
3. **Configurar Conversions** - Para objetivos de negocio
4. **Implementar Custom Dimensions** - Para datos específicos de MOVBE
5. **Agregar Funnel Analysis** - Para optimizar el user journey

### Análisis de Datos

1. Configurar dashboards personalizados
2. Establecer alertas para métricas clave
3. Crear reportes automatizados
4. Implementar A/B testing con GA4

## Troubleshooting

### Problemas Comunes

1. **Eventos no aparecen** - Verificar que NEXT_PUBLIC_GA_ID esté configurado
2. **Datos inconsistentes** - Verificar que no haya ad blockers activos
3. **Errores de TypeScript** - Verificar tipos en las funciones de tracking

### Debug Mode

Para habilitar el modo debug de GA4:

```javascript
window.gtag('config', GA_TRACKING_ID, {
  debug_mode: true,
})
```

## Cumplimiento y Privacidad

- Los eventos respetan las configuraciones de consentimiento
- No se envían datos personales identificables
- Compatible con GDPR y otras regulaciones de privacidad
- Los usuarios pueden opt-out del tracking
