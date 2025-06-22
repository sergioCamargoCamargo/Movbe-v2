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

## Workflow Disponible

### CI/CD Pipeline (`ci-cd.yml`)

- **Triggers:**
  - Push a `main`/`dev` 
  - Pull Requests hacia `main`/`dev`

- **Jobs ejecutados:**
  1. **Quality Check:** Linting, formato y type checking
  2. **Build:** Compilación de la aplicación
  3. **Deploy Production:** Deploy a producción (rama `main`)
  4. **Deploy Development:** Deploy a desarrollo (rama `dev`) 
  5. **Deploy Preview:** Deploy temporal (Pull Requests)

- **Ambientes de deployment:**
  - 🟢 **Production:** `main` → Vercel Production Environment
  - 🟡 **Development:** `dev` → Vercel Preview Environment
  - 🔵 **Preview:** PRs → Vercel Preview temporal con comentario

- **Flujo por rama:**
  - **`main`:** Quality → Build → Deploy Production
  - **`dev`:** Quality → Build → Deploy Development + Comentario en commit
  - **PRs:** Quality → Build → Deploy Preview + Comentario en PR

## Uso

1. **Desarrollo en rama `dev`:**
   - Push a `dev` → Deploy automático al ambiente de desarrollo
   - URL de desarrollo se comenta en el commit

2. **Testing con Pull Requests:**
   - Crea PR desde cualquier rama → Deploy temporal de preview
   - URL de preview se comenta en el PR

3. **Producción:**
   - Merge a `main` → Deploy automático a producción
   - Ambiente estable para usuarios finales

4. **Flujo recomendado:**
   ```
   feature-branch → PR → dev → testing → PR → main → production
   ```

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
