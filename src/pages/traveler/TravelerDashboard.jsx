import { Link } from 'react-router-dom'
import { FaMagic, FaCalendarCheck, FaHeart, FaMapMarkedAlt } from 'react-icons/fa'
import StarRating from '../../components/shared/StarRating'
import Badge from '../../components/shared/Badge'
import EmptyState from '../../components/shared/EmptyState'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { destinations } from '../../data/destinations'
import { homestays } from '../../data/homestays'

export default function TravelerDashboard() {
  const { user } = useAuth()
  const { bookings, favoriteDestinations } = useApp()

  const myBookings = bookings.filter((b) => b.travelerId === user.id)
  const upcoming = myBookings.filter((b) => b.status === 'upcoming')
  const recommendedDestinations = destinations.slice(0, 3)
  const savedDestinations = destinations.filter((d) => favoriteDestinations.includes(d.id))
  const recentActivity = [...myBookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4)

  return (
    <div>
      {/* Welcome card */}
      <div className="rounded-2xl bg-teal-900 p-6 sm:p-8">
        <p className="text-sm font-medium text-terracotta-400">Welcome back</p>
        <h1 className="mt-1 font-display text-2xl font-medium text-white sm:text-3xl">
          Hi {user.fullName.split(' ')[0]}, where to next?
        </h1>
        <Link
          to="/recommendations"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-terracotta-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-terracotta-600"
        >
          <FaMagic size={14} /> Get AI recommendations
        </Link>
      </div>

      {/* Summary cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard icon={FaCalendarCheck} label="Upcoming trips" value={upcoming.length} />
        <SummaryCard icon={FaHeart} label="Saved destinations" value={savedDestinations.length} />
        <SummaryCard icon={FaMapMarkedAlt} label="Total bookings" value={myBookings.length} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Upcoming trips */}
        <div className="lg:col-span-2">
          <h2 className="font-display text-lg font-medium text-[#10263A] dark:text-[#F5F3EE]">Upcoming trips</h2>
          <div className="mt-3 flex flex-col gap-3">
            {upcoming.length === 0 ? (
              <EmptyState
                icon={<FaCalendarCheck />}
                title="No upcoming trips"
                description="Book a homestay to see it here."
                action={<Link to="/homestays" className="text-sm font-medium text-teal-700">Browse homestays →</Link>}
              />
            ) : (
              upcoming.map((b) => {
                const h = homestays.find((x) => x.id === b.homestayId)
                if (!h) return null
                return (
                  <div key={b.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
                    <img src={h.image} alt={h.name} className="h-14 w-14 rounded-xl object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#10263A] dark:text-[#F5F3EE]">{h.name}</p>
                      <p className="text-xs text-ink-500">{b.checkIn} → {b.checkOut}</p>
                    </div>
                    <Badge status={b.status}>{b.status}</Badge>
                  </div>
                )
              })
            )}
          </div>

          {/* Recent activity */}
          <h2 className="mt-8 font-display text-lg font-medium text-[#10263A] dark:text-[#F5F3EE]">Recent activity</h2>
          <div className="mt-3 flex flex-col gap-2">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-[#10263A] dark:text-[#F5F3EE]">No recent activity yet.</p>
            ) : (
              recentActivity.map((b) => {
                const h = homestays.find((x) => x.id === b.homestayId)
                return (
                  <div key={b.id} className="flex items-center justify-between rounded-xl bg-white p-3 text-sm shadow-sm">
                    <span className="text-ink-700">Booked <span className="font-medium">{h?.name}</span></span>
                    <span className="text-xs text-ink-500">{b.createdAt}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Recommended destinations + saved */}
        <div>
          <h2 className="font-display text-lg font-medium text-[#10263A] dark:text-[#F5F3EE]">Recommended for you</h2>
          <div className="mt-3 flex flex-col gap-3">
            {recommendedDestinations.map((d) => (
              <Link key={d.id} to={`/destination/${d.id}`} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm hover:shadow-md">
                <img src={d.image} alt={d.name} className="h-12 w-12 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink-900">{d.name}</p>
                  <StarRating rating={d.rating} size={10} />
                </div>
              </Link>
            ))}
          </div>

          <h2 className="mt-8 font-display text-lg font-medium text-[#10263A] dark:text-[#F5F3EE]">Saved destinations</h2>
          <div className="mt-3 flex flex-col gap-3">
            {savedDestinations.length === 0 ? (
              <p className="text-sm text-ink-500">Tap the heart on a destination to save it here.</p>
            ) : (
              savedDestinations.map((d) => (
                <Link key={d.id} to={`/destination/${d.id}`} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm hover:shadow-md">
                  <img src={d.image} alt={d.name} className="h-12 w-12 rounded-xl object-cover" />
                  <p className="text-sm font-medium text-ink-900">{d.name}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
        <Icon size={18} />
      </div>
      <div>
        <p className="font-display text-2xl font-medium text-ink-900">{value}</p>
        <p className="text-xs text-ink-500">{label}</p>
      </div>
    </div>
  )
}
