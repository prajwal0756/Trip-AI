import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)
const TOKEN_KEY = 'tripai_access_token'

function normalizeUser(user) {
  if (!user) return null

  return {
    ...user,
    id: String(user.user_id ?? user.id),
    fullName: user.full_name ?? user.fullName,
    role: user.role === 'user' ? 'traveler' : user.role,
    avatar: user.profile_image ?? user.avatar ?? null,
    joinedDate: user.created_at ?? user.joinedDate ?? null,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore logged-in user when the app starts
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)

    if (!token) {
      setLoading(false)
      return
    }

    api
      .get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUser(normalizeUser(response.data))
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      })

      const { access_token } = response.data

      localStorage.setItem(TOKEN_KEY, access_token)

      const userResponse = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })

      const loggedInUser = normalizeUser(userResponse.data)
      setUser(loggedInUser)

      return {
        success: true,
        user: loggedInUser,
      }
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.detail ||
          'Unable to login. Please try again.',
      }
    }
  }, [])

  const register = useCallback(async ({ fullName, email, password, phoneNumber }) => {
    try {
      const response = await api.post('/auth/register', {
        full_name: fullName,
        email,
        password,
        phone_number: phoneNumber || null,
      })

      return {
        success: true,
        user: normalizeUser(response.data),
      }
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.detail ||
          'Unable to register. Please try again.',
      }
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  const updateProfile = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return ctx
}
