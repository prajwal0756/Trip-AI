import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import ProtectedRoute from './routes/ProtectedRoute'
import ToastContainer from './components/shared/Toast'

import PublicLayout from './layouts/PublicLayout'
import TravelerLayout from './layouts/TravelerLayout'
import OwnerLayout from './layouts/OwnerLayout'

import Home from './pages/public/Home'
import About from './pages/public/About'
import Contact from './pages/public/Contact'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import Destinations from './pages/public/Destinations'
import DestinationDetails from './pages/public/DestinationDetails'
import Homestays from './pages/public/Homestays'
import NotFound from './pages/public/NotFound'

import TravelerDashboard from './pages/traveler/TravelerDashboard'
import RecommendationForm from './pages/traveler/RecommendationForm'
import Bookings from './pages/traveler/Bookings'
import Favorites from './pages/traveler/Favorites'
import Reviews from './pages/traveler/Reviews'
import Profile from './pages/traveler/Profile'

import OwnerDashboard from './pages/owner/OwnerDashboard'
import AddHomestay from './pages/owner/AddHomestay'
import ManageHomestays from './pages/owner/ManageHomestays'
import OwnerBookings from './pages/owner/OwnerBookings'
import OwnerReviews from './pages/owner/OwnerReviews'
import Analytics from './pages/owner/Analytics'
import OwnerProfile from './pages/owner/OwnerProfile'

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes (shared navbar/footer) */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/destination/:id" element={<DestinationDetails />} />
              <Route path="/homestays" element={<Homestays />} />
            </Route>

            {/* Traveler dashboard routes */}
            <Route
              element={
                <ProtectedRoute role="traveler">
                  <TravelerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<TravelerDashboard />} />
              <Route path="/recommendations" element={<RecommendationForm />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Owner dashboard routes */}
            <Route
              element={
                <ProtectedRoute role="owner">
                  <OwnerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/owner" element={<OwnerDashboard />} />
              <Route path="/owner/add" element={<AddHomestay />} />
              <Route path="/owner/manage" element={<ManageHomestays />} />
              <Route path="/owner/bookings" element={<OwnerBookings />} />
              <Route path="/owner/reviews" element={<OwnerReviews />} />
              <Route path="/owner/analytics" element={<Analytics />} />
              <Route path="/owner/profile" element={<OwnerProfile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  )
}
