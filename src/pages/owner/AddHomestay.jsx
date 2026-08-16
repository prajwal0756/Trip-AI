import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaPlusCircle, FaUpload } from 'react-icons/fa'
import Button from '../../components/shared/Button'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { destinations } from '../../data/destinations'

const fallbackImages = [
  'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
]

const initialForm = {
  name: '',
  destinationId: destinations[0].id,
  location: '',
  price: '',
  description: '',
  amenities: '',
  capacity: 2,
  availability: 'Available',
}

export default function AddHomestay() {
  const { user } = useAuth()
  const { addHomestay } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    const image = fallbackImages[Math.floor(Math.random() * fallbackImages.length)]
    setTimeout(() => {
      addHomestay({
        name: form.name,
        destinationId: form.destinationId,
        ownerId: user.id,
        ownerName: user.fullName,
        location: form.location,
        image,
        images: [image],
        price: Number(form.price),
        rating: 0,
        reviewCount: 0,
        capacity: Number(form.capacity),
        amenities: form.amenities.split(',').map((a) => a.trim()).filter(Boolean),
        availability: form.availability,
        description: form.description,
      })
      setSubmitting(false)
      navigate('/owner/manage')
    }, 600)
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <FaPlusCircle size={18} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-medium text-ink-900">Add a homestay</h1>
          <p className="text-sm text-ink-500">List a new property for travelers to discover.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">Homestay name</label>
          <input
            required
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Lakeview Bamboo Homestay"
            className="w-full rounded-xl border border-ink-900/10 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Nearest destination</label>
            <select
              name="destinationId"
              value={form.destinationId}
              onChange={handleChange}
              className="w-full rounded-xl border border-ink-900/10 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
            >
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Location</label>
            <input
              required
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Lakeside, Pokhara"
              className="w-full rounded-xl border border-ink-900/10 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Price per night (USD)</label>
            <input
              required
              type="number"
              min={1}
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full rounded-xl border border-ink-900/10 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Capacity (guests)</label>
            <input
              required
              type="number"
              min={1}
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              className="w-full rounded-xl border border-ink-900/10 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">Description</label>
          <textarea
            required
            rows={4}
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your homestay…"
            className="w-full rounded-xl border border-ink-900/10 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">Amenities (comma-separated)</label>
          <input
            name="amenities"
            value={form.amenities}
            onChange={handleChange}
            placeholder="Free Wi-Fi, Home-cooked meals, Garden"
            className="w-full rounded-xl border border-ink-900/10 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">Availability</label>
          <select
            name="availability"
            value={form.availability}
            onChange={handleChange}
            className="w-full rounded-xl border border-ink-900/10 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
          >
            <option value="Available">Available</option>
            <option value="Limited">Limited</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">Upload images</label>
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ink-900/15 p-6 text-center">
            <FaUpload className="text-ink-500/50" size={20} />
            <p className="text-xs text-ink-500">Drag and drop or click to upload (mock — a sample image will be assigned)</p>
          </div>
        </div>

        <Button type="submit" loading={submitting} className="self-start">
          Add homestay
        </Button>
      </form>
    </div>
  )
}
