import { useEffect, useState } from 'react'
import { AuthContext } from './authContext'
import { subscribeToAuth } from '../services/auth'

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
