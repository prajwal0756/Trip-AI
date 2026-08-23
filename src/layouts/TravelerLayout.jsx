import { Outlet } from 'react-router-dom'
import {
  FaHome,
  FaMagic,
  FaMapMarkedAlt,
  FaBed,
  FaCalendarCheck,
  FaHeart,
  FaStar,
  FaUserCircle,
} from 'react-icons/fa'
import Sidebar from '../components/layout/Sidebar'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: FaHome, end: true },
  // { to: '/recommendations', label: 'AI Recommendation', icon: FaMagic },
  // { to: '/destinations', label: 'Destinations', icon: FaMapMarkedAlt },
  // { to: '/homestays', label: 'Homestays', icon: FaBed },
  { to: '/bookings', label: 'Bookings', icon: FaCalendarCheck },
  { to: '/favorites', label: 'Favorites', icon: FaHeart },
  { to: '/reviews', label: 'Reviews', icon: FaStar },
  { to: '/profile', label: 'Settings', icon: FaUserCircle },
]

export default function TravelerLayout() {
  return (
    <div className="flex min-h-screen bg-sand-100">
      <Sidebar links={links} title="Traveler" />
      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}
