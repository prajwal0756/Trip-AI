import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { bookings as mockBookings } from '../data/bookings'
import { reviews as mockReviews } from '../data/reviews'
import { homestays as mockHomestays } from '../data/homestays'
import api from '../api/client'
import { useAuth } from './AuthContext'

const AppContext = createContext(null)

let toastId = 0

export function AppProvider({ children }) {
    const { user, loading: authLoading } = useAuth()
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
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [reviews, setReviews] = useState(mockReviews)
  const [homestays, setHomestays] = useState(mockHomestays)
  const [toasts, setToasts] = useState([])

    useEffect(() => {
      if (authLoading) {
        return
      }

      if (!user) {
        setBookings([])
        setBookingsLoading(false)
        return
      }

      setBookingsLoading(true)

      api
        .get('/bookings/')
        .then((response) => {
          const normalizedBookings = response.data.map((b) => ({
            id: String(b.booking_id),
            homestayId: b.homestay_id,
            travelerId: String(b.user_id),
            travelerName: user.fullName,
            checkIn: b.check_in,
            checkOut: b.check_out,
            guests: b.guests,
            totalPrice: b.total_price,
            status: b.status,
            createdAt: b.created_at
              ? String(b.created_at).slice(0, 10)
              : null,
          }))

          console.log('Backend bookings:', response.data)
          console.log('Normalized bookings:', normalizedBookings)
          console.log('Logged-in user:', user)

          setBookings(normalizedBookings)
        })
        .catch((error) => {
          console.error(
            'Failed to load bookings:',
            error.response?.data || error
          )

          setBookings([])
        })
        .finally(() => {
          setBookingsLoading(false)
        })
    }, [user, authLoading])

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
    async (booking) => {
      try {
        const response = await api.post('/bookings/', {
          homestay_id: booking.homestayId,
          check_in: booking.checkIn,
          check_out: booking.checkOut,
          guests: Number(booking.guests),
          total_price: Number(booking.totalPrice),
        })

        const backendBooking = response.data

        const frontendBooking = {
          id: String(backendBooking.booking_id),
          homestayId: backendBooking.homestay_id,
          travelerId: String(backendBooking.user_id),
          checkIn: backendBooking.check_in,
          checkOut: backendBooking.check_out,
          guests: backendBooking.guests,
          totalPrice: backendBooking.total_price,
          status: backendBooking.status,
          createdAt: backendBooking.created_at,
        }

        setBookings((prev) => [
          frontendBooking,
          ...prev,
        ])

        pushToast('Booking confirmed!')

        return {
          success: true,
          booking: frontendBooking,
        }
      } catch (error) {
        console.error(
          'Booking failed:',
          error
        )

        pushToast(
          error.response?.data?.detail ||
            'Unable to create booking',
          'danger'
        )

        return {
          success: false,
        }
      }
    },
    [pushToast]
  )

  const updateBookingStatus = useCallback(
    async (bookingId, status) => {
      try {
        const response = await api.patch(
          `/bookings/${bookingId}/status`,
          null,
          {
            params: {
              status_value: status,
            },
          }
        )

        const updatedBooking = response.data

        setBookings((prev) =>
          prev.map((booking) =>
            String(booking.id) === String(bookingId)
              ? {
                  ...booking,
                  status: updatedBooking.status,
                }
              : booking
          )
        )

        pushToast(`Booking marked as ${status}`)

        return {
          success: true,
          booking: updatedBooking,
        }
      } catch (error) {
        console.error('Failed to update booking:', error)

        pushToast(
          error.response?.data?.detail ||
            'Unable to update booking',
          'danger'
        )

        return {
          success: false,
        }
      }
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
        bookingsLoading,
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
