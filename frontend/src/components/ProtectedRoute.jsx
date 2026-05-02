import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function ProtectedRoute({ role }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    // Redirect to correct home based on actual role
    return <Navigate to={user.role === 'STAFF' ? '/staff' : '/dashboard'} replace />
  }

  return <Outlet />
}
