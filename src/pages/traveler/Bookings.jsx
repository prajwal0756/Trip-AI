import { useState, useMemo, useEffect } from 'react'
import { FaCalendarCheck } from 'react-icons/fa'

import BookingCard from '../../components/cards/BookingCard'
import EmptyState from '../../components/shared/EmptyState'

import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import api from '../../api/client'

const tabs = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

export default function Bookings() {
  const { user } = useAuth()

  const {
    bookings,
    updateBookingStatus,
  } = useApp()

  const [tab, setTab] =
    useState('upcoming')

  const [homestays, setHomestays] =
    useState([])

  const [loadingHomestays, setLoadingHomestays] =
    useState(true)

  // --------------------------------------------------
  // LOAD BACKEND HOMESTAYS
  // --------------------------------------------------

  useEffect(() => {
    api
      .get('/homestays/', {
        params: {
          limit: 100,
        },
      })
      .then((response) => {
        console.log(
          'Backend homestays:',
          response.data
        )

        const normalized =
          response.data.map((h) => ({
            id: h.homestay_id,

            name: h.homestay_name,

            location: [
              h.municipality,
              h.district,
              h.province,
            ]
              .filter(Boolean)
              .join(', '),

            image: null,

            price:
              h.price_per_night_npr,

            rating:
              h.rating,

            description:
              h.description,
          }))

        setHomestays(normalized)
      })
      .catch((error) => {
        console.error(
          'Failed to load homestays:',
          error.response?.data || error
        )

        setHomestays([])
      })
      .finally(() => {
        setLoadingHomestays(false)
      })
  }, [])

  // --------------------------------------------------
  // USER BOOKINGS
  // --------------------------------------------------

  const myBookings = useMemo(() => {
    if (!user) return []

    return bookings.filter(
      (b) =>
        String(b.travelerId) ===
          String(user.id) &&
        b.status === tab
    )
  }, [bookings, user, tab])

  // --------------------------------------------------
  // CANCEL
  // --------------------------------------------------

  const handleCancel = (bookingId) =>
    updateBookingStatus(
      bookingId,
      'cancelled'
    )

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-ink-900">
        My bookings
      </h1>

      <p className="mt-1 text-sm text-ink-500">
        Track your homestay reservations.
      </p>

      <div
        className="mt-6 flex gap-2 rounded-xl bg-white p-1.5 shadow-sm"
        role="tablist"
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-teal-900 text-white'
                : 'text-ink-500 hover:bg-sand-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4">

        {loadingHomestays ? (
          <div className="rounded-2xl bg-white p-8 text-center text-ink-500">
            Loading bookings...
          </div>
        ) : myBookings.length === 0 ? (
          <EmptyState
            icon={<FaCalendarCheck />}
            title={`No ${tab} bookings`}
            description={
              tab === 'upcoming'
                ? 'Book a homestay to see it here.'
                : `You don't have any ${tab} bookings yet.`
            }
          />
        ) : (
          myBookings.map((booking) => {
            const homestay =
              homestays.find(
                (h) =>
                  String(h.id) ===
                  String(booking.homestayId)
              )

            return (
              <BookingCard
                key={booking.id}
                booking={booking}
                homestay={homestay}
                onCancel={
                  tab === 'upcoming'
                    ? handleCancel
                    : undefined
                }
              />
            )
          })
        )}

      </div>
    </div>
  )
}