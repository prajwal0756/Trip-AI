import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Backend uses "user" for normal travelers.
  // Frontend uses "traveler".
  const userRole = user.role === 'user' ? 'traveler' : user.role

  if (role && userRole !== role) {
    return <Navigate to={userRole === 'owner' ? '/owner' : '/dashboard'} replace />
  }

  return children
}