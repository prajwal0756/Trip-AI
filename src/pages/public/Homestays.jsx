import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { FaBed } from 'react-icons/fa'
import HomestayCard from '../../components/cards/HomestayCard'
import SearchBar from '../../components/shared/SearchBar'
import FilterSelect from '../../components/shared/FilterSelect'
import Pagination from '../../components/shared/Pagination'
import EmptyState from '../../components/shared/EmptyState'
import Modal from '../../components/shared/Modal'
import Button from '../../components/shared/Button'
import { CardSkeletonGrid } from '../../components/shared/SkeletonLoader'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { useDelayedLoading } from '../../hooks/useDelayedLoading'
const PAGE_SIZE = 6

export default function Homestays() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { homestays, addBooking, pushToast } = useApp()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [availability, setAvailability] = useState('All')
  const [sort, setSort] = useState('rating')
  const [page, setPage] = useState(1)
  const [bookingHomestay, setBookingHomestay] = useState(null)
  const [bookingForm, setBookingForm] = useState({ checkIn: '', checkOut: '', guests: 1 })
  const loading = useDelayedLoading([query, availability, sort])

  useEffect(() => {
    const bookId = searchParams.get('book')
    if (bookId) {
      const h = homestays.find((x) => x.id === bookId)
      if (h) setBookingHomestay(h)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const filtered = useMemo(() => {
    let result = homestays.filter((h) => {
      const matchesQuery =
        !query ||
        h.name.toLowerCase().includes(query.toLowerCase()) ||
        h.location.toLowerCase().includes(query.toLowerCase())
      const matchesAvailability = availability === 'All' || h.availability === availability
      return matchesQuery && matchesAvailability
    })

    if (sort === 'rating') result = [...result].sort((a, b) => b.rating - a.rating)
    if (sort === 'price-low') result = [...result].sort((a, b) => a.price - b.price)
    if (sort === 'price-high') result = [...result].sort((a, b) => b.price - a.price)

    return result
  }, [homestays, query, availability, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const closeModal = () => {
    setBookingHomestay(null)
    setBookingForm({ checkIn: '', checkOut: '', guests: 1 })
    searchParams.delete('book')
    setSearchParams(searchParams)
  }

  const nights = useMemo(() => {
    if (!bookingForm.checkIn || !bookingForm.checkOut) return 0
    const diff = new Date(bookingForm.checkOut) - new Date(bookingForm.checkIn)
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)))
  }, [bookingForm])

  const handleConfirmBooking = (e) => {
    e.preventDefault()
    if (!user) {
      pushToast('Please login to book a homestay', 'danger')
      closeModal()
      navigate('/login')
      return
    }
    if (nights <= 0) {
      pushToast('Check-out date must be after check-in', 'danger')
      return
    }
    addBooking({
      homestayId: bookingHomestay.id,
      travelerId: user.id,
      travelerName: user.fullName,
      checkIn: bookingForm.checkIn,
      checkOut: bookingForm.checkOut,
      guests: Number(bookingForm.guests),
      totalPrice: nights * bookingHomestay.price,
    })
    closeModal()
    navigate('/bookings')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-sm font-medium text-terracotta-500">Stay local</p>
        <h1 className="mt-2 font-display text-3xl font-medium text-ink-900 sm:text-4xl">Homestays</h1>
        <p className="mt-2 text-sm text-ink-500">Browse verified homestays hosted by local families.</p>
      </div>

      <div className="mt-8 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <SearchBar
          value={query}
          onChange={(v) => { setQuery(v); setPage(1) }}
          placeholder="Search by homestay name or location…"
          className="flex-1"
        />
        <FilterSelect
          label="Availability"
          value={availability}
          onChange={(v) => { setAvailability(v); setPage(1) }}
          options={['All', 'Available', 'Limited']}
        />
        <FilterSelect
          label="Sort by"
          value={sort}
          onChange={setSort}
          options={[
            { value: 'rating', label: 'Highest rated' },
            { value: 'price-low', label: 'Price: low to high' },
            { value: 'price-high', label: 'Price: high to low' },
          ]}
        />
      </div>

      <p className="mt-6 text-sm text-ink-500">{filtered.length} homestay{filtered.length !== 1 ? 's' : ''} found</p>

      <div className="mt-4">
        {loading ? (
          <CardSkeletonGrid count={6} />
        ) : paginated.length === 0 ? (
          <EmptyState icon={<FaBed />} title="No homestays match your filters" description="Try adjusting your search or clearing a filter." />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((h) => (
              <HomestayCard key={h.id} homestay={h} onBook={() => setBookingHomestay(h)} />
            ))}
          </div>
        )}
      </div>

      {!loading && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}

      <Modal isOpen={!!bookingHomestay} onClose={closeModal} title={bookingHomestay ? `Book ${bookingHomestay.name}` : ''}>
        {bookingHomestay && (
          <form onSubmit={handleConfirmBooking} className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-xl bg-sand-100 p-3">
              <img src={bookingHomestay.image} alt={bookingHomestay.name} className="h-14 w-14 rounded-lg object-cover" />
              <div>
                <p className="text-sm font-medium text-ink-900">{bookingHomestay.name}</p>
                <p className="text-xs text-ink-500">${bookingHomestay.price} / night</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Check-in</label>
                <input
                  required
                  type="date"
                  value={bookingForm.checkIn}
                  onChange={(e) => setBookingForm((f) => ({ ...f, checkIn: e.target.value }))}
                  className="w-full rounded-xl border border-ink-900/10 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Check-out</label>
                <input
                  required
                  type="date"
                  value={bookingForm.checkOut}
                  onChange={(e) => setBookingForm((f) => ({ ...f, checkOut: e.target.value }))}
                  className="w-full rounded-xl border border-ink-900/10 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Guests</label>
              <input
                required
                type="number"
                min={1}
                max={bookingHomestay.capacity}
                value={bookingForm.guests}
                onChange={(e) => setBookingForm((f) => ({ ...f, guests: e.target.value }))}
                className="w-full rounded-xl border border-ink-900/10 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-ink-500">Max capacity: {bookingHomestay.capacity} guests</p>
            </div>

            {nights > 0 && (
              <div className="flex items-center justify-between rounded-xl bg-teal-50 p-3 text-sm">
                <span className="text-teal-700">{nights} night{nights > 1 ? 's' : ''}</span>
                <span className="font-medium text-teal-900">${nights * bookingHomestay.price} total</span>
              </div>
            )}

            <Button type="submit" fullWidth>
              Confirm booking
            </Button>
          </form>
        )}
      </Modal>
    </div>
  )
}
