import { Navigate, Outlet } from 'react-router-dom'
import LoadingScreen from '../LoadingScreen/LoadingScreen'
import { useAuth } from '../../hooks/useAuth'

// Route guard: waits out the initial session restore, then either
// renders the child route or redirects signed-out visitors home.
const ProtectedRoute = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) return <LoadingScreen />
  if (!user) return <Navigate to="/" replace />
  return <Outlet />
}

export default ProtectedRoute
