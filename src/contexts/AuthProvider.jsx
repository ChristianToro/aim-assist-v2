import { useMemo } from 'react'
import { AuthContext } from './authContext'
import { useAuthSession } from '../services/auth'
import { toAppUser } from '../utils/authUser'

// Exposes the signed-in Neon Auth user in the app's user shape. isLoading
// covers the initial session restore so the UI doesn't flash "signed out"
// on refresh.
const AuthProvider = ({ children }) => {
  const { data, isPending } = useAuthSession()
  const sessionUser = data?.user

  const value = useMemo(
    () => ({ user: toAppUser(sessionUser), isLoading: isPending }),
    [sessionUser, isPending]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
