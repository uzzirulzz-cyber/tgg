import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../services/authStore.js'

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent-blue border-t-transparent" />
      </div>
    )
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute
