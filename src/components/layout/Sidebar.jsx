import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'

export default function Sidebar({ links, title = 'Dashboard' }) {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Link to="/" className="font-display text-lg font-semibold text-ink-900 dark:text-sand-100">
          Trip<span className="text-terracotta-500">AI</span>
        </Link>
        <button
          className="text-ink-700 dark:text-sand-100/70 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <FaTimes size={18} />
        </button>
      </div>

      {user && (
        <div className="mx-4 mb-4 flex items-center gap-3 rounded-xl bg-sand-100/50 dark:bg-sand-100/5 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-900 text-sm font-semibold text-white">
            {user.fullName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink-900 dark:text-sand-100">{user.fullName}</p>
            <p className="truncate text-xs capitalize text-ink-700/70 dark:text-sand-100/50">{user.role}</p>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3">
        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-ink-700/60 dark:text-sand-100/40">
          {title}
        </p>
        <ul className="flex flex-col gap-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sand-100/50 text-ink-900 dark:bg-sand-100/10 dark:text-sand-100'
                      : 'text-ink-700/70 dark:text-sand-100/70 hover:bg-sand-100/30 dark:hover:bg-sand-100/5 hover:text-ink-900 dark:hover:text-sand-100'
                  }`
                }
              >
                <link.icon size={16} />
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-3 pb-5 pt-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700/70 dark:text-sand-100/70 hover:bg-sand-100/30 dark:hover:bg-sand-100/5 hover:text-ink-900 dark:hover:text-sand-100"
        >
          <FaSignOutAlt size={16} />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between bg-sand-100 text-ink-900 dark:bg-ink-900 dark:text-sand-100 px-4 py-3 lg:hidden">
        <Link to="/" className="font-display text-lg font-semibold">
          Trip<span className="text-terracotta-500">AI</span>
        </Link>
        <button
          className="text-ink-900 dark:text-sand-100"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <FaBars size={20} />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40 dark:bg-sand-100/20" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-sand-100 text-ink-900 dark:bg-ink-900 dark:text-sand-100">
            {content}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-64 shrink-0 bg-sand-100 text-ink-900 dark:bg-ink-900 dark:text-sand-100 lg:sticky lg:top-0 lg:flex">
        {content}
      </aside>
    </>
  )
}
