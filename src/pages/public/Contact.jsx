import { useState } from 'react'
import { FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa'
import Button from '../../components/shared/Button'
import { useApp } from '../../context/AppContext'

export default function Contact() {
  const { pushToast } = useApp()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setForm({ name: '', email: '', message: '' })
      pushToast('Message sent — we\'ll get back to you soon.')
    }, 800)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-sm font-medium text-terracotta-500">Get in touch</p>
        <h1 className="mt-2 font-display text-3xl font-medium text-ink-900 sm:text-4xl">We'd love to hear from you</h1>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-3">
            <FaEnvelope className="mt-1 text-teal-700" />
            <div>
              <p className="text-sm font-medium text-ink-900">Email</p>
              <p className="text-sm text-ink-500">hello@tripai.example</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FaPhone className="mt-1 text-teal-700" />
            <div>
              <p className="text-sm font-medium text-ink-900">Phone</p>
              <p className="text-sm text-ink-500">+977 1-234-5678</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FaMapMarkerAlt className="mt-1 text-teal-700" />
            <div>
              <p className="text-sm font-medium text-ink-900">Address</p>
              <p className="text-sm text-ink-500">Biratnagar, Koshi Province, Nepal</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Name</label>
            <input
              required
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-ink-900/10 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Email</label>
            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-ink-900/10 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Message</label>
            <textarea
              required
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={5}
              className="w-full rounded-xl border border-ink-900/10 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
              placeholder="How can we help?"
            />
          </div>
          <Button type="submit" loading={submitting} className="mt-1 self-start">
            Send message
          </Button>
        </form>
      </div>
    </div>
  )
}
