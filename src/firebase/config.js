// Firebase app initialization.
// Credentials come from Vite env vars (see .env.example). Keeping this module
// as the single source of the initialized app/auth/db instances means services
// import from here rather than re-initializing Firebase anywhere else.
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Fail loudly in development if .env is missing or incomplete —
// otherwise Firebase throws opaque errors much later.
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key)
if (missingKeys.length > 0) {
  console.warn(
    `Firebase config is missing: ${missingKeys.join(', ')}. ` +
      'Copy .env.example to .env and fill in your project credentials.'
  )
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
