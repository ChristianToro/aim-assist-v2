import { useEffect, useState } from 'react'
import { AuthContext } from './authContext'
import { subscribeToAuth } from '../services/auth'
import { ensureUserDocument } from '../services/users'

// Tracks the signed-in Firebase user. isLoading covers the initial
// session restore so the UI doesn't flash "signed out" on refresh.
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(
    () =>
      subscribeToAuth((nextUser) => {
        setUser(nextUser)
        setIsLoading(false)
        // Fire-and-forget: the profile document isn't needed for the UI
        // to proceed, and a failure here shouldn't block sign-in.
        if (nextUser) {
          ensureUserDocument(nextUser).catch((error) =>
            console.error('Failed to ensure user document:', error)
          )
        }
      }),
    []
  )

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
