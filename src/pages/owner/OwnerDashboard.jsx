import { Link } from 'react-router-dom'
import { FaBed, FaCalendarCheck, FaDollarSign, FaStar, FaChartPie } from 'react-icons/fa'
import Badge from '../../components/shared/Badge'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'

export default function OwnerDashboard() {
  const { user } = useAuth()
  const { homestays, bookings, reviews } = useApp()

  const myHomestays = homestays.filter((h) => h.ownerId === user.id)
  const myHomestayIds = myHomestays.map((h) => h.id)
  const myBookings = bookings.filter((b) => myHomestayIds.includes(b.homestayId))
  const myReviews = reviews.filter((r) => r.targetType === 'homestay' && myHomestayIds.includes(r.targetId))

  const revenue = myBookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.totalPrice, 0)

  const avgRating = myHomestays.length
    ? (myHomestays.reduce((sum, h) => sum + h.rating, 0) / myHomestays.length).toFixed(1)
    : '—'

  const occupancyRate = myHomestays.length
    ? Math.round((myHomestays.filter((h) => h.availability !== 'Available').length / myHomestays.length) * 100)
    : 0

  const recentBookings = [...myBookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-ink-900">Welcome back, {user.fullName.split(' ')[0]}</h1>
      <p className="mt-1 text-sm text-ink-500">Here's how your homestays are performing.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard icon={FaBed} label="Total homestays" value={myHomestays.length} />
        <SummaryCard icon={FaCalendarCheck} label="Total bookings" value={myBookings.length} />
        <SummaryCard icon={FaDollarSign} label="Revenue" value={`$${revenue}`} />
        <SummaryCard icon={FaStar} label="Avg. rating" value={avgRating} />
        <SummaryCard icon={FaChartPie} label="Occupancy" value={`${occupancyRate}%`} />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-ink-900">Recent bookings</h2>
          <Link to="/owner/bookings" className="text-sm font-medium text-teal-700">View all →</Link>
        </div>

        <div className="mt-3 overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-900/5 text-xs text-ink-500">
                <th className="px-4 py-3 font-medium">Traveler</th>
                <th className="px-4 py-3 font-medium">Homestay</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-ink-500">No bookings yet.</td>
                </tr>
              ) : (
                recentBookings.map((b) => {
                  const h = myHomestays.find((x) => x.id === b.homestayId)
                  return (
                    <tr key={b.id} className="border-b border-ink-900/5 last:border-0">
                      <td className="px-4 py-3 text-ink-900">{b.travelerName}</td>
                      <td className="px-4 py-3 text-ink-700">{h?.name}</td>
                      <td className="px-4 py-3 text-ink-500">{b.checkIn} → {b.checkOut}</td>
                      <td className="px-4 py-3 font-medium text-ink-900">${b.totalPrice}</td>
                      <td className="px-4 py-3"><Badge status={b.status}>{b.status}</Badge></td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="font-display text-xl font-medium text-ink-900">{value}</p>
        <p className="truncate text-xs text-ink-500">{label}</p>
      </div>
    </div>
  )
}
