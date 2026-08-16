import { createContext, useContext, useState, useCallback } from 'react'
import { users as mockUsers } from '../data/users'

const AuthContext = createContext(null)
const SESSION_KEY = 'tripai_session_user_id'

function loadInitialUser(allUsers) {
  try {
    const savedId = localStorage.getItem(SESSION_KEY)
    if (!savedId) return null
    return allUsers.find((u) => u.id === savedId) || null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [allUsers, setAllUsers] = useState(mockUsers)
  const [user, setUser] = useState(() => loadInitialUser(mockUsers))

  const persistSession = (nextUser) => {
    try {
      if (nextUser) localStorage.setItem(SESSION_KEY, nextUser.id)
      else localStorage.removeItem(SESSION_KEY)
    } catch {
      // localStorage unavailable (e.g. private browsing) — session just won't persist
    }
  }

  const login = useCallback(
    (email, password) => {
      const found = allUsers.find((u) => u.email === email && u.password === password)
      if (!found) {
        return { success: false, message: 'Incorrect email or password.' }
      }
      setUser(found)
      persistSession(found)
      return { success: true, user: found }
    },
    [allUsers]
  )

  const register = useCallback(
    ({ fullName, email, password, role }) => {
      const exists = allUsers.some((u) => u.email === email)
      if (exists) {
        return { success: false, message: 'An account with this email already exists.' }
      }
      const newUser = {
        id: `u_${role}_${Date.now()}`,
        role,
        fullName,
        email,
        password,
        avatar: `https://i.pravatar.cc/150?u=${email}`,
        joinedDate: new Date().toISOString().slice(0, 10),
      }
      setAllUsers((prev) => [...prev, newUser])
      setUser(newUser)
      persistSession(newUser)
      return { success: true, user: newUser }
    },
    [allUsers]
  )

  const logout = useCallback(() => {
    setUser(null)
    persistSession(null)
  }, [])

  const updateProfile = useCallback((updates) => {
    setUser((prev) => {
      const next = prev ? { ...prev, ...updates } : prev
      if (next) persistSession(next)
      return next
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
