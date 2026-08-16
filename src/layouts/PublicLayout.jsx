import { Outlet } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F4EE] dark:bg-[#0B1117] transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
