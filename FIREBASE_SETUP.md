# Firebase Authentication Setup (Basic)

Simple Firebase Authentication integration for login, registration, and password recovery.

## 🔥 Firebase Console Configuration

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter your project name (e.g., "movbe-v2")
4. Follow the setup wizard

### 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable the following providers:
   - **Email/Password**: Click to enable
   - **Google**: Click to enable and configure OAuth
   - **GitHub**: Click to enable and configure OAuth (optional)

### 3. Get Firebase Configuration

1. Go to Project Settings (gear icon in the left sidebar)
2. Scroll down to "Your apps" section
3. Click "Add app" and select the web icon (`</>`)
4. Register your app with a nickname
5. Copy the configuration object

## 🔧 Environment Setup

### 1. Create Environment Variables

Create a `.env.local` file in your project root:

```bash
cp .env.local.example .env.local
```

### 2. Add Firebase Configuration

Edit `.env.local` with your Firebase config values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

## 🎯 Features

### ✅ Basic Authentication

- **Email/Password Authentication**

  - User registration with email and password
  - Login with email and password
  - Password reset via email

- **Social Authentication**
  - Google Sign-In
  - GitHub Sign-In (optional)

### 🔐 Security Features

- Firebase security rules (automatically configured)
- Error handling with user-friendly messages
- Loading states for all auth operations

## 📱 Available Pages

- `/auth/login` - Login page with email/password and social login
- `/auth/register` - Registration page with name, email, and password
- `/auth/recovery` - Password reset page
- `/` - Home page (no authentication required)

## 🚀 Usage

Import Firebase auth functions directly in your components:

```tsx
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'

// Login
await signInWithEmailAndPassword(auth, email, password)

// Register
await createUserWithEmailAndPassword(auth, email, password)

// Check current user
const user = auth.currentUser
```

## 🐛 Troubleshooting

### Common Issues

1. **Firebase config errors**: Make sure all environment variables are set correctly
2. **Authentication domain**: Ensure your domain is added in Firebase Console > Authentication > Settings > Authorized domains
3. **Google/GitHub OAuth**: Make sure to configure OAuth properly in Firebase Console

### Development Tips

- Check the browser console for Firebase errors
- Verify environment variables: `console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)`
- Test in incognito mode

## 📚 Next Steps

1. Add user state management (Context/Redux)
2. Implement route protection as needed
3. Add user profile management
4. Configure Firebase Security Rules
