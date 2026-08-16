import { useState, useMemo } from 'react'
import { FaCalendarCheck } from 'react-icons/fa'
import BookingCard from '../../components/cards/BookingCard'
import EmptyState from '../../components/shared/EmptyState'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'

const tabs = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

export default function Bookings() {
  const { user } = useAuth()
  const { bookings, updateBookingStatus } = useApp()
  const [tab, setTab] = useState('upcoming')

  const myBookings = useMemo(
    () => bookings.filter((b) => b.travelerId === user.id && b.status === tab),
    [bookings, user.id, tab]
  )

  const handleCancel = (bookingId) => updateBookingStatus(bookingId, 'cancelled')

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-ink-900">My bookings</h1>
      <p className="mt-1 text-sm text-ink-500">Track your homestay reservations.</p>

      <div className="mt-6 flex gap-2 rounded-xl bg-white p-1.5 shadow-sm" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-teal-900 text-white' : 'text-ink-500 hover:bg-sand-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {myBookings.length === 0 ? (
          <EmptyState
            icon={<FaCalendarCheck />}
            title={`No ${tab} bookings`}
            description={tab === 'upcoming' ? 'Book a homestay to see it here.' : `You don't have any ${tab} bookings yet.`}
          />
        ) : (
          myBookings.map((b) => (
            <BookingCard key={b.id} booking={b} onCancel={tab === 'upcoming' ? handleCancel : undefined} />
          ))
        )}
      </div>
    </div>
  )
}
