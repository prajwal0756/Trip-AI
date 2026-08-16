import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { bookings as mockBookings } from '../data/bookings'
import { reviews as mockReviews } from '../data/reviews'
import { homestays as mockHomestays } from '../data/homestays'

const AppContext = createContext(null)

let toastId = 0

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('tripai_theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('tripai_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('tripai_theme', 'light')
    }
  }, [darkMode])

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev)
  }, [])

  const [favoriteDestinations, setFavoriteDestinations] = useState(['d1'])
  const [favoriteHomestays, setFavoriteHomestays] = useState(['h1'])
  const [bookings, setBookings] = useState(mockBookings)
  const [reviews, setReviews] = useState(mockReviews)
  const [homestays, setHomestays] = useState(mockHomestays)
  const [toasts, setToasts] = useState([])

  const pushToast = useCallback((message, type = 'success') => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toggleFavoriteDestination = useCallback(
    (id) => {
      setFavoriteDestinations((prev) => {
        const isFav = prev.includes(id)
        pushToast(isFav ? 'Removed from favorites' : 'Added to favorites')
        return isFav ? prev.filter((x) => x !== id) : [...prev, id]
      })
    },
    [pushToast]
  )

  const toggleFavoriteHomestay = useCallback(
    (id) => {
      setFavoriteHomestays((prev) => {
        const isFav = prev.includes(id)
        pushToast(isFav ? 'Removed from favorites' : 'Added to favorites')
        return isFav ? prev.filter((x) => x !== id) : [...prev, id]
      })
    },
    [pushToast]
  )

  const addBooking = useCallback(
    (booking) => {
      setBookings((prev) => [{ ...booking, id: `b_${Date.now()}`, status: 'upcoming', createdAt: new Date().toISOString().slice(0, 10) }, ...prev])
      pushToast('Booking confirmed!')
    },
    [pushToast]
  )

  const updateBookingStatus = useCallback(
    (bookingId, status) => {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)))
      pushToast(`Booking marked as ${status}`)
    },
    [pushToast]
  )

  const addReview = useCallback(
    (review) => {
      setReviews((prev) => [{ ...review, id: `r_${Date.now()}`, date: new Date().toISOString().slice(0, 10) }, ...prev])
      pushToast('Review submitted — thank you!')
    },
    [pushToast]
  )

  const addHomestay = useCallback(
    (homestay) => {
      setHomestays((prev) => [{ ...homestay, id: `h_${Date.now()}` }, ...prev])
      pushToast('Homestay added successfully')
    },
    [pushToast]
  )

  const updateHomestay = useCallback(
    (id, updates) => {
      setHomestays((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)))
      pushToast('Homestay updated')
    },
    [pushToast]
  )

  const deleteHomestay = useCallback(
    (id) => {
      setHomestays((prev) => prev.filter((h) => h.id !== id))
      pushToast('Homestay deleted', 'danger')
    },
    [pushToast]
  )

  return (
    <AppContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        favoriteDestinations,
        favoriteHomestays,
        toggleFavoriteDestination,
        toggleFavoriteHomestay,
        bookings,
        addBooking,
        updateBookingStatus,
        reviews,
        addReview,
        homestays,
        addHomestay,
        updateHomestay,
        deleteHomestay,
        toasts,
        pushToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
