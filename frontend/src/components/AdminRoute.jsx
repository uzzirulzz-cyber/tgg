import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../services/authStore.js'

const AdminRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent-blue border-t-transparent" />
      </div>
    )
  }

  const isAdmin = isAuthenticated && ['admin', 'super_admin', 'manager', 'support_agent'].includes(user?.role)

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />
}

export default AdminRoute
