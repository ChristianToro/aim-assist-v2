import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../firebase/config'

// All Firebase Auth access goes through this service — components and
// contexts never import firebase/auth directly (see ARCHITECTURE.md).

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider)

export const signOutUser = () => signOut(auth)

// Subscribes to auth state; returns the unsubscribe function.
export const subscribeToAuth = (callback) => onAuthStateChanged(auth, callback)

// Errors that mean "the user changed their mind", not a failure.
export const isUserCancellation = (error) =>
  error?.code === 'auth/popup-closed-by-user' ||
  error?.code === 'auth/cancelled-popup-request'
