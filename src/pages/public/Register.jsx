import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaUser, FaEnvelope, FaLock, FaMapMarkerAlt, FaHome } from 'react-icons/fa'
import Button from '../../components/shared/Button'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'

export default function Register() {
  const { register } = useAuth()
  const { pushToast } = useApp()
  const navigate = useNavigate()
  const [role, setRole] = useState('traveler')
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      const result = register({ ...form, role })
      setLoading(false)
      if (!result.success) {
        setError(result.message)
        return
      }
      pushToast(`Welcome to TripAI, ${result.user.fullName.split(' ')[0]}!`)
      navigate(role === 'owner' ? '/owner' : '/dashboard')
    }, 500)
  }

  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-[#F7F4EE] dark:bg-[#0B1117] px-4 py-12 transition-colors duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[#FFFCF7] dark:bg-[#121C27] border border-navy-900/10 dark:border-white/10 p-8 shadow-sm transition-colors duration-200">
        <div className="text-center">
          <Link to="/" className="font-display text-xl font-semibold text-[#10263A] dark:text-white">
            Trip<span className="text-terracotta-500">AI</span>
          </Link>
          <h1 className="mt-4 font-display text-2xl font-semibold text-[#10263A] dark:text-[#F5F3EE]">Create your account</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-[#AAB5C0]">Join as a traveler or list your homestay.</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            onClick={() => setRole('traveler')}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors ${
              role === 'traveler'
                ? 'border-terracotta-500 bg-terracotta-500/10 text-terracotta-500 dark:bg-terracotta-500/20'
                : 'border-navy-900/10 dark:border-white/15 text-ink-500 dark:text-[#AAB5C0]'
            }`}
          >
            <FaMapMarkerAlt size={16} /> Traveler
          </button>
          <button
            onClick={() => setRole('owner')}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors ${
              role === 'owner'
                ? 'border-terracotta-500 bg-terracotta-500/10 text-terracotta-500 dark:bg-terracotta-500/20'
                : 'border-navy-900/10 dark:border-white/15 text-ink-500 dark:text-[#AAB5C0]'
            }`}
          >
            <FaHome size={16} /> Homestay owner
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#10263A] dark:text-[#F5F3EE]">Full name</label>
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={14} />
              <input
                required
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="w-full rounded-xl border border-navy-900/10 dark:border-white/15 bg-transparent py-2.5 pl-11 pr-4 text-sm text-[#10263A] dark:text-white placeholder:text-ink-500/60 dark:placeholder:text-slate-400 focus:border-terracotta-500 focus:outline-none"
                placeholder="Your full name"
              />
            </div>
          </div>
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
                placeholder="At least 6 characters"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#10263A] dark:text-[#F5F3EE]">Confirm password</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={14} />
              <input
                required
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-xl border border-navy-900/10 dark:border-white/15 bg-transparent py-2.5 pl-11 pr-4 text-sm text-[#10263A] dark:text-white placeholder:text-ink-500/60 dark:placeholder:text-slate-400 focus:border-terracotta-500 focus:outline-none"
                placeholder="Re-enter password"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" loading={loading} fullWidth className="mt-2 bg-terracotta-500 hover:bg-terracotta-600 text-white shadow-sm">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500 dark:text-[#AAB5C0]">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-terracotta-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
