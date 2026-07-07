import { Navigate, Outlet } from 'react-router-dom'
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner'
import { useAuth } from '../../hooks/useAuth'

// Route guard: waits out the initial session restore, then either
// renders the child route or redirects signed-out visitors home.
const ProtectedRoute = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />
  return <Outlet />
}

export default ProtectedRoute
