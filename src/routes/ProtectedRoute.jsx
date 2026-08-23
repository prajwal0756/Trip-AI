// import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Backend uses "user" for normal travelers.
  // Frontend uses "traveler".
  const userRole = user.role === 'user' ? 'traveler' : user.role

  if (role && userRole !== role) {
    return <Navigate to={userRole === 'owner' ? '/owner' : '/dashboard'} replace />
  }

  return children
}