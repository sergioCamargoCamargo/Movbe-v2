# Sistema de Categorías con Firebase

## Descripción

El sistema de categorías ha sido mejorado para usar Firebase como fuente de datos, permitiendo la gestión dinámica de categorías desde la base de datos.

## Implementación

### 1. Colección Firebase

Las categorías se almacenan en la colección `categories` con la siguiente estructura:

```typescript
interface CategoryDocument {
  id: string              // ID único generado automáticamente
  name: VideoCategory     // Nombre de la categoría
  description: string     // Descripción de la categoría
  order: number          // Orden de visualización
  isActive: boolean      // Si la categoría está activa
  createdAt: Timestamp   // Fecha de creación
  updatedAt?: Timestamp  // Fecha de última actualización
  deletedAt?: Timestamp  // Fecha de soft delete
}
```

### 2. Funciones Principales

#### `getCategories()`
- Obtiene categorías activas **únicamente** desde Firebase
- Cuenta automáticamente videos por categoría
- Retorna array vacío si no hay categorías en Firebase
- Lanza error si hay problemas de conexión

#### `initializeCategories()`
- Inicializa la colección con categorías predeterminadas
- Se ejecuta automáticamente en la página principal
- Solo crea categorías si la colección está vacía

#### `addCategory(category)`
- Agrega una nueva categoría a Firebase
- Valida que no exista duplicado
- Asigna orden automáticamente

#### `updateCategory(id, updates)`
- Actualiza una categoría existente
- Permite cambiar nombre, descripción, orden y estado

#### `deleteCategory(id)`
- Soft delete de una categoría
- Marca como inactiva en lugar de eliminar

### 3. Uso en Componentes

```typescript
// En páginas server-side
const categories = await getCategories()

// En componentes client-side
const { categories, loading } = useCategoriesData()
```

### 4. Filtrado de Videos

Los videos se filtran por categoría usando:

```typescript
const filteredVideos = useMemo(() => {
  if (selectedCategory === 'Todo') {
    return videos
  }
  return videos.filter(video => video.category === selectedCategory)
}, [videos, selectedCategory])
```

### 5. Ventajas de la Nueva Implementación

1. **Dinamismo**: Las categorías se pueden agregar/editar sin código
2. **Escalabilidad**: Maneja automáticamente el crecimiento de categorías
3. **Rendimiento**: Cuenta de videos optimizada
4. **Consistencia**: Siempre usa Firebase como fuente única de verdad
5. **Ordenamiento**: Categorías ordenadas por popularidad

### 6. Configuración Inicial

Para usar el sistema de categorías:
1. **Inicialización**: La primera carga crea automáticamente la colección
2. **Gestión**: Todas las categorías se manejan desde Firebase
3. **Requisito**: Debe existir la colección `categories` en Firebase

**Nota**: Si no hay categorías en Firebase, solo se mostrará "Todo" hasta que se agreguen categorías.

## Próximos Pasos

1. Crear interface de administración para categorías
2. Implementar cache para mejorar rendimiento
3. Agregar soporte para subcategorías
4. Implementar categorías por idioma