import { useState } from 'react'
import { FaCamera } from 'react-icons/fa'
import Button from '../../components/shared/Button'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import useTheme from '../../hooks/useTheme'

export default function OwnerProfile() {
  const { user, updateProfile } = useAuth()
  const { pushToast } = useApp()
  const [theme, setTheme] = useTheme()
  const [form, setForm] = useState({ fullName: user.fullName, email: user.email })
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleAvatarChange = () => {
    const seed = Math.floor(Math.random() * 70) + 1
    updateProfile({ avatar: `https://i.pravatar.cc/150?img=${seed}` })
    pushToast('Profile photo updated')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      updateProfile(form)
      setSaving(false)
      pushToast('Profile updated')
    }, 500)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-medium text-ink-900">Profile & Settings</h1>
      <p className="mt-1 text-sm text-ink-500">Manage your owner account information and preferences.</p>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={user.avatar} alt={user.fullName} className="h-20 w-20 rounded-full object-cover" />
            <button
              onClick={handleAvatarChange}
              aria-label="Change avatar"
              className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-teal-900 text-white shadow"
            >
              <FaCamera size={11} />
            </button>
          </div>
          <div>
            <p className="font-display text-lg font-medium text-ink-900">{user.fullName}</p>
            <p className="text-sm capitalize text-ink-500">{user.role} · joined {user.joinedDate}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Full name</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="w-full rounded-xl border border-ink-900/10 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-ink-900/10 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
            />
          </div>
          <Button type="submit" loading={saving} className="self-start">
            Save changes
          </Button>
        </form>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-medium text-ink-900">App Theme</h2>
        <p className="mt-1 text-sm text-ink-500">Choose how TripAI looks to you.</p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { id: 'light', name: 'Light Mode', icon: '☀️', desc: 'Clean and bright' },
            { id: 'dark', name: 'Dark Mode', icon: '🌙', desc: 'Easy on the eyes' },
            { id: 'system', name: 'System Default', icon: '💻', desc: 'Syncs with your OS' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all cursor-pointer ${
                theme === t.id
                  ? 'border-teal-500 bg-teal-50/50 text-teal-900'
                  : 'border-ink-900/10 hover:border-teal-500/50'
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              <span className="mt-2 text-sm font-semibold text-ink-900">{t.name}</span>
              <span className="text-xs text-ink-500">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
