# GitHub Actions Setup Guide

Este proyecto incluye workflows de GitHub Actions para CI/CD automatizado con Vercel.

## Configuración de Secrets

Para que los workflows funcionen correctamente, necesitas configurar estos secrets en tu repositorio de GitHub:

### Repository Secrets

Ve a `Settings` → `Secrets and variables` → `Actions` en tu repositorio de GitHub y agrega:

#### 1. Vercel Configuration
- `VERCEL_TOKEN`: Tu token de acceso de Vercel
  - Ve a [Vercel Settings → Tokens](https://vercel.com/account/tokens)
  - Crea un nuevo token con scope "Full Account"
- `VERCEL_ORG_ID`: Tu Vercel Organization ID
  - Ejecuta `vercel link` en tu proyecto local
  - O ve a Project Settings → General en Vercel Dashboard
- `VERCEL_PROJECT_ID`: Tu Vercel Project ID
  - Ejecuta `vercel link` en tu proyecto local
  - O ve a Project Settings → General en Vercel Dashboard

#### 2. Firebase Configuration
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Tu Firebase API Key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Tu Firebase Auth Domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Tu Firebase Project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Tu Firebase Storage Bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Tu Firebase Messaging Sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Tu Firebase App ID

### Configuración de Vercel

1. **Conecta tu repositorio a Vercel:**
   - Ve a [Vercel Dashboard](https://vercel.com/dashboard)
   - Importa tu repositorio de GitHub
   - Configura las variables de entorno en Vercel Dashboard

2. **Configura las variables de entorno en Vercel:**
   - En tu proyecto de Vercel, ve a `Settings` → `Environment Variables`
   - Agrega todas las variables de Firebase que configuraste en GitHub Secrets

## Workflows Disponibles

### 1. CI Pipeline (`ci.yml`)
- **Trigger:** Push a `main`/`dev` y Pull Requests
- **Acciones:**
  - Linting con ESLint
  - Verificación de formato con Prettier
  - Type checking con TypeScript
  - Build de la aplicación

### 2. Deploy to Vercel (`deploy.yml`)
- **Trigger:** Push a `main` (después de CI exitoso)
- **Acciones:**
  - Deploy automático a producción en Vercel
  - Deploy de preview para Pull Requests

### 3. CI/CD Complete (`ci-cd.yml`)
- **Workflow completo que combina:**
  - Quality checks (lint, format, type)
  - Build
  - Deploy a producción (main branch)
  - Deploy de preview (Pull Requests)
  - Comentarios automáticos en PRs con URL de preview

## Uso

1. **Para desarrollo:**
   - Crea una rama desde `dev`
   - Haz tus cambios
   - Crea un Pull Request hacia `main`
   - Los checks de calidad se ejecutarán automáticamente
   - Se creará un deployment de preview

2. **Para producción:**
   - Merge el PR a `main`
   - Se ejecutará el deployment automático a producción

## Configuración Local

1. Copia `.env.example` a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Llena las variables de entorno con tus valores de Firebase

3. Instala dependencias:
   ```bash
   npm install
   ```

4. Ejecuta el proyecto:
   ```bash
   npm run dev
   ```

## Comandos Útiles

```bash
# Verificar linting
npm run lint

# Corregir linting automáticamente
npm run lint:fix

# Verificar formato
npm run format:check

# Aplicar formato
npm run format

# Type checking
npm run type-check

# Build
npm run build
```