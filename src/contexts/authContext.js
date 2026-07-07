import { createContext } from 'react'

// Consumed via the useAuth() hook; provided by AuthProvider.
export const AuthContext = createContext({ user: null, isLoading: true })
