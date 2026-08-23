import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaEnvelope, FaLock } from 'react-icons/fa'
import Button from '../../components/shared/Button'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'

export default function Login() {
  const { login } = useAuth()
  const { pushToast } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(form.email, form.password)

    setLoading(false)

    if (!result.success) {
      setError(result.message)
      return
    }

    pushToast(`Welcome back, ${result.user.fullName.split(' ')[0]}!`)

    const from = location.state?.from?.pathname

    navigate(
      from && from.startsWith('/')
        ? from
        : result.user.role === 'owner'
          ? '/owner'
          : '/dashboard',
      { replace: true }
    )
  }

  const fillDemo = (role) => {
    if (role === 'traveler') setForm({ email: 'aarav@example.com', password: 'password123' })
    else setForm({ email: 'sita@example.com', password: 'password123' })
  }

  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-[#F7F4EE] dark:bg-[#0B1117] px-4 py-12 transition-colors duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[#FFFCF7] dark:bg-[#121C27] border border-navy-900/10 dark:border-white/10 p-8 shadow-sm transition-colors duration-200">
        <div className="text-center">
          <Link to="/" className="font-display text-xl font-semibold text-[#10263A] dark:text-white">
            Trip<span className="text-terracotta-500">AI</span>
          </Link>
          <h1 className="mt-4 font-display text-2xl font-semibold text-[#10263A] dark:text-[#F5F3EE]">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-[#AAB5C0]">Log in to view your recommendations and bookings.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#10263A] dark:text-[#F5F3EE]">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={14} />
              <input
                required
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-navy-900/10 dark:border-white/15 bg-transparent py-2.5 pl-11 pr-4 text-sm text-[#10263A] dark:text-white placeholder:text-ink-500/60 dark:placeholder:text-slate-400 focus:border-terracotta-500 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#10263A] dark:text-[#F5F3EE]">Password</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={14} />
              <input
                required
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-navy-900/10 dark:border-white/15 bg-transparent py-2.5 pl-11 pr-4 text-sm text-[#10263A] dark:text-white placeholder:text-ink-500/60 dark:placeholder:text-slate-400 focus:border-terracotta-500 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" loading={loading} fullWidth className="mt-2 bg-terracotta-500 hover:bg-terracotta-600 text-white shadow-sm">
            Login
          </Button>
        </form>

        <div className="mt-5 flex items-center gap-2 text-xs text-ink-500 dark:text-[#AAB5C0]">
          <div className="h-px flex-1 bg-navy-900/10 dark:bg-white/10" />
          Try a demo account
          <div className="h-px flex-1 bg-navy-900/10 dark:bg-white/10" />
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={() => fillDemo('traveler')} className="flex-1 rounded-xl border border-navy-900/10 dark:border-white/15 py-2 text-xs font-medium text-[#10263A] dark:text-[#F5F3EE] hover:bg-sand-100 dark:hover:bg-white/10 transition-colors">
            Traveler demo
          </button>
          <button onClick={() => fillDemo('owner')} className="flex-1 rounded-xl border border-navy-900/10 dark:border-white/15 py-2 text-xs font-medium text-[#10263A] dark:text-[#F5F3EE] hover:bg-sand-100 dark:hover:bg-white/10 transition-colors">
            Owner demo
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-ink-500 dark:text-[#AAB5C0]">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-terracotta-500 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
