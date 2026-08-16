import { FaCalendarAlt, FaUsers } from 'react-icons/fa'
import Badge from '../shared/Badge'
import Button from '../shared/Button'
import { homestays } from '../../data/homestays'

export default function BookingCard({ booking, onCancel }) {
  const homestay = homestays.find((h) => h.id === booking.homestayId)
  if (!homestay) return null

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <img src={homestay.image} alt={homestay.name} className="h-24 w-full rounded-xl object-cover sm:w-32" />
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-medium text-ink-900">{homestay.name}</h3>
          <Badge status={booking.status}>{booking.status}</Badge>
        </div>
        <p className="mt-1 text-sm text-ink-500">{homestay.location}</p>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-ink-500">
          <span className="flex items-center gap-1.5">
            <FaCalendarAlt size={11} /> {booking.checkIn} → {booking.checkOut}
          </span>
          <span className="flex items-center gap-1.5">
            <FaUsers size={11} /> {booking.guests} guest{booking.guests > 1 ? 's' : ''}
          </span>
          <span className="font-medium text-ink-900">${booking.totalPrice} total</span>
        </div>
      </div>
      {booking.status === 'upcoming' && onCancel && (
        <Button variant="danger" size="sm" onClick={() => onCancel(booking.id)}>
          Cancel booking
        </Button>
      )}
    </div>
  )
}
