import { useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'

const COLORS = ['#0F4C4C', '#D97A4D', '#4D7C5F', '#6FA89C']
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Analytics() {
  const { user } = useAuth()
  const { homestays, bookings, reviews } = useApp()

  const myHomestays = homestays.filter((h) => h.ownerId === user.id)
  const myHomestayIds = myHomestays.map((h) => h.id)
  const myBookings = bookings.filter((b) => myHomestayIds.includes(b.homestayId))
  const myReviews = reviews.filter((r) => r.targetType === 'homestay' && myHomestayIds.includes(r.targetId))

  const monthlyBookings = useMemo(() => {
    const counts = Array(12).fill(0)
    myBookings.forEach((b) => {
      const month = new Date(b.createdAt).getMonth()
      counts[month] += 1
    })
    return MONTH_LABELS.map((label, i) => ({ month: label, bookings: counts[i] }))
  }, [myBookings])

  const monthlyRevenue = useMemo(() => {
    const totals = Array(12).fill(0)
    myBookings.filter((b) => b.status !== 'cancelled').forEach((b) => {
      const month = new Date(b.createdAt).getMonth()
      totals[month] += b.totalPrice
    })
    return MONTH_LABELS.map((label, i) => ({ month: label, revenue: totals[i] }))
  }, [myBookings])

  const occupancyData = useMemo(() => {
    const available = myHomestays.filter((h) => h.availability === 'Available').length
    const limited = myHomestays.filter((h) => h.availability === 'Limited').length
    const unavailable = myHomestays.filter((h) => h.availability === 'Unavailable').length
    return [
      { name: 'Available', value: available },
      { name: 'Limited', value: limited },
      { name: 'Unavailable', value: unavailable },
    ].filter((d) => d.value > 0)
  }, [myHomestays])

  const ratingDistribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]
    myReviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1] += 1
    })
    return counts.map((count, i) => ({ rating: `${i + 1}★`, count }))
  }, [myReviews])

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-ink-900">Analytics</h1>
      <p className="mt-1 text-sm text-ink-500">Performance overview for your listed homestays.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Monthly bookings">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyBookings}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C262512" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#4A5654" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#4A5654" />
              <Tooltip />
              <Bar dataKey="bookings" fill="#0F4C4C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly revenue">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C262512" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#4A5654" />
              <YAxis tick={{ fontSize: 11 }} stroke="#4A5654" />
              <Tooltip formatter={(v) => [`$${v}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#D97A4D" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Occupancy status">
          {occupancyData.length === 0 ? (
            <p className="py-16 text-center text-sm text-ink-500">No homestays listed yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={occupancyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {occupancyData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Rating distribution">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ratingDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1C262512" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="#4A5654" />
              <YAxis type="category" dataKey="rating" tick={{ fontSize: 11 }} stroke="#4A5654" width={32} />
              <Tooltip />
              <Bar dataKey="count" fill="#4D7C5F" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="font-display text-base font-medium text-ink-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  )
}
