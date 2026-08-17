import { FaCalendarAlt, FaUsers } from 'react-icons/fa'
import Badge from '../shared/Badge'
import Button from '../shared/Button'

export default function BookingCard({
  booking,
  homestay,
  onCancel,
}) {
  if (!homestay) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="font-medium text-ink-900">
          Homestay information unavailable
        </p>

        <p className="mt-1 text-sm text-ink-500">
          Homestay ID: {booking.homestayId}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="h-24 w-full overflow-hidden rounded-xl bg-sand-100 sm:w-32">
        {homestay.image ? (
          <img
            src={homestay.image}
            alt={homestay.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-ink-400">
            No image
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-medium text-ink-900">
            {homestay.name}
          </h3>

          <Badge status={booking.status}>
            {booking.status}
          </Badge>
        </div>

        <p className="mt-1 text-sm text-ink-500">
          {homestay.location}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-ink-500">
          <span className="flex items-center gap-1.5">
            <FaCalendarAlt size={11} />

            {booking.checkIn} → {booking.checkOut}
          </span>

          <span className="flex items-center gap-1.5">
            <FaUsers size={11} />

            {booking.guests} guest
            {booking.guests > 1 ? 's' : ''}
          </span>

          <span className="font-medium text-ink-900">
            NPR {booking.totalPrice} total
          </span>
        </div>
      </div>

      {booking.status === 'upcoming' && onCancel && (
        <Button
          variant="danger"
          size="sm"
          onClick={() => onCancel(booking.id)}
        >
          Cancel booking
        </Button>
      )}
    </div>
  )
}