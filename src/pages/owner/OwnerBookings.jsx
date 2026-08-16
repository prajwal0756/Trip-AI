import { useState, useMemo } from 'react'
import { FaCalendarCheck, FaCheck, FaTimes } from 'react-icons/fa'
import Badge from '../../components/shared/Badge'
import Button from '../../components/shared/Button'
import EmptyState from '../../components/shared/EmptyState'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'

const tabs = [
  { key: 'upcoming', label: 'Pending / Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

export default function OwnerBookings() {
  const { user } = useAuth()
  const { homestays, bookings, updateBookingStatus } = useApp()
  const [tab, setTab] = useState('upcoming')

  const myHomestayIds = homestays.filter((h) => h.ownerId === user.id).map((h) => h.id)

  const filteredBookings = useMemo(
    () => bookings.filter((b) => myHomestayIds.includes(b.homestayId) && b.status === tab),
    [bookings, myHomestayIds, tab]
  )

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-ink-900">Booking management</h1>
      <p className="mt-1 text-sm text-ink-500">Accept, reject, or mark bookings as completed.</p>

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

      <div className="mt-6 flex flex-col gap-3">
        {filteredBookings.length === 0 ? (
          <EmptyState icon={<FaCalendarCheck />} title={`No ${tab} bookings`} description="Bookings will appear here as travelers reserve your homestays." />
        ) : (
          filteredBookings.map((b) => {
            const h = homestays.find((x) => x.id === b.homestayId)
            return (
              <div key={b.id} className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                <img src={h?.image} alt={h?.name} className="h-20 w-full rounded-xl object-cover sm:w-28" />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-ink-900">{h?.name}</p>
                    <Badge status={b.status}>{b.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-ink-500">Booked by {b.travelerName}</p>
                  <p className="mt-1 text-xs text-ink-500">{b.checkIn} → {b.checkOut} · {b.guests} guest{b.guests > 1 ? 's' : ''} · ${b.totalPrice}</p>
                </div>
                {tab === 'upcoming' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" icon={<FaCheck />} onClick={() => updateBookingStatus(b.id, 'completed')}>
                      Mark completed
                    </Button>
                    <Button size="sm" variant="danger" icon={<FaTimes />} onClick={() => updateBookingStatus(b.id, 'cancelled')}>
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
