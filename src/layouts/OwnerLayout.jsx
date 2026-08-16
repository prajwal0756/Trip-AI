import { Outlet } from 'react-router-dom'
import {
  FaHome,
  FaBed,
  FaPlusCircle,
  FaTasks,
  FaCalendarCheck,
  FaStar,
  FaChartLine,
  FaUserCircle,
} from 'react-icons/fa'
import Sidebar from '../components/layout/Sidebar'

const links = [
  { to: '/owner', label: 'Dashboard', icon: FaHome, end: true },
  { to: '/owner/manage', label: 'My Homestays', icon: FaBed },
  { to: '/owner/add', label: 'Add Homestay', icon: FaPlusCircle },
  { to: '/owner/bookings', label: 'Bookings', icon: FaCalendarCheck },
  { to: '/owner/reviews', label: 'Reviews', icon: FaStar },
  { to: '/owner/analytics', label: 'Analytics', icon: FaChartLine },
  { to: '/owner/profile', label: 'Settings', icon: FaUserCircle },
]

export default function OwnerLayout() {
  return (
    <div className="flex min-h-screen bg-sand-100">
      <Sidebar links={links} title="Owner" />
      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}
