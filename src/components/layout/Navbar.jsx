import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FaBars, FaTimes, FaUserCircle, FaSun, FaMoon } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import Button from '../shared/Button'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/destinations', label: 'Destinations' },
  { to: '/recommendations', label: 'AI Recommendation' },
  { to: '/homestays', label: 'Homestays' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useApp()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const dashboardPath = user?.role === 'owner' ? '/owner' : '/dashboard'

  return (
    <header className="sticky top-0 z-40 border-b border-ink-900/5 dark:border-white/10 bg-sand-50/90 dark:bg-navy-950/90 backdrop-blur-sm transition-colors duration-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="font-display text-xl font-semibold text-teal-900 dark:text-white">
          Trip<span className="text-terracotta-500">AI</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-teal-900 dark:text-white font-semibold'
                    : 'text-ink-500 hover:text-teal-900 dark:text-slate-300 dark:hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-900/10 dark:border-white/20 bg-white/60 dark:bg-navy-900/60 text-ink-700 dark:text-amber-300 hover:bg-white dark:hover:bg-navy-800 transition-colors shadow-sm"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <FaSun size={15} /> : <FaMoon size={14} />}
          </button>

          {user ? (
            <>
              <Link to={dashboardPath} className="flex items-center gap-2 text-sm font-medium text-ink-700 dark:text-slate-200 hover:text-teal-900 dark:hover:text-white">
                <FaUserCircle size={18} /> {user.fullName.split(' ')[0]}
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-ink-700 dark:text-slate-200 hover:text-teal-900 dark:hover:text-white">
                Login
              </Link>
              <Button size="sm" onClick={() => navigate('/register')}>
                Get started
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {/* Mobile Dark Mode Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-900/10 dark:border-white/20 bg-white/60 dark:bg-navy-900/60 text-ink-700 dark:text-amber-300 hover:bg-white dark:hover:bg-navy-800 transition-colors"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <FaSun size={15} /> : <FaMoon size={14} />}
          </button>

          <button
            className="text-ink-900 dark:text-white"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-ink-900/5 dark:border-white/10 bg-sand-50 dark:bg-navy-950 px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-medium ${
                    isActive
                      ? 'text-teal-900 dark:text-white font-semibold'
                      : 'text-ink-700 dark:text-slate-300'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-ink-900/5 dark:border-white/10 pt-3">
              {user ? (
                <>
                  <Link to={dashboardPath} onClick={() => setOpen(false)} className="text-sm font-medium text-ink-700 dark:text-slate-200">
                    Dashboard
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-ink-700 dark:text-slate-200">
                    Login
                  </Link>
                  <Button size="sm" onClick={() => { setOpen(false); navigate('/register') }}>
                    Get started
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
