import { useState, useEffect, useMemo } from 'react'
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
import api from '../../api/client'

const PAGE_SIZE = 6

export default function Homestays() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { addBooking, pushToast } = useApp()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [homestays, setHomestays] = useState([])
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('rating')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const [bookingHomestay, setBookingHomestay] = useState(null)
  const [bookingForm, setBookingForm] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
  })

    // --------------------------------------------------
  // Load homestays from backend
  // --------------------------------------------------

    useEffect(() => {
      const loadHomestays = async () => {
        try {
          setLoading(true)

          let response

          if (query.trim()) {
            // Search across the complete homestay database
            response = await api.get('/homestays/search', {
              params: {
                q: query.trim(),
                limit: 100,
              },
            })
          } else {
            // Normal paginated listing
            response = await api.get('/homestays/', {
              params: {
                page,
                limit: PAGE_SIZE,
              },
            })
          }

          const data = response.data || []

          setHomestays(data)

          if (query.trim()) {
            // Search endpoint returns the complete matching set
            setTotalPages(
              Math.max(
                1,
                Math.ceil(data.length / PAGE_SIZE)
              )
            )
          } else {
            // Existing pagination behaviour
            setTotalPages(
              data.length < PAGE_SIZE
                ? page
                : page + 1
            )
          }

        } catch (error) {
          console.error(
            'Failed to load homestays:',
            error
          )

          setHomestays([])
          setTotalPages(1)

        } finally {
          setLoading(false)
        }
      }

      loadHomestays()

    }, [page, query])


  // --------------------------------------------------
  // Sort results
  // --------------------------------------------------

    const filtered = useMemo(() => {
      const result = [...homestays]

      if (sort === 'rating') {
        result.sort(
          (a, b) =>
            Number(b.rating || 0) -
            Number(a.rating || 0)
        )
      }

      if (sort === 'price-low') {
        result.sort(
          (a, b) =>
            Number(a.price_per_night_npr || 0) -
            Number(b.price_per_night_npr || 0)
        )
      }

      if (sort === 'price-high') {
        result.sort(
          (a, b) =>
            Number(b.price_per_night_npr || 0) -
            Number(a.price_per_night_npr || 0)
        )
      }

      return result
    }, [homestays, sort])

 

  // --------------------------------------------------
  // Open booking modal from URL
  // --------------------------------------------------

  useEffect(() => {
    const bookId = searchParams.get('book')

    if (!bookId) return

    const found = homestays.find(
      (h) => h.homestay_id === bookId
    )

    if (found) {
      setBookingHomestay(found)
    }
  }, [searchParams, homestays])

  // --------------------------------------------------
  // Booking
  // --------------------------------------------------

  const closeModal = () => {
    setBookingHomestay(null)

    setBookingForm({
      checkIn: '',
      checkOut: '',
      guests: 1,
    })

    const params = new URLSearchParams(searchParams)
    params.delete('book')
    setSearchParams(params)
  }

  const nights = useMemo(() => {
    if (
      !bookingForm.checkIn ||
      !bookingForm.checkOut
    ) {
      return 0
    }

    const diff =
      new Date(bookingForm.checkOut) -
      new Date(bookingForm.checkIn)

    return Math.max(
      0,
      Math.round(
        diff /
          (1000 * 60 * 60 * 24)
      )
    )
  }, [bookingForm])

  const handleConfirmBooking = async (e) => {
    e.preventDefault()

    if (!user) {
      pushToast(
        'Please login to book a homestay',
        'danger'
      )

      closeModal()
      navigate('/login')
      return
    }

    if (nights <= 0) {
      pushToast(
        'Check-out date must be after check-in',
        'danger'
      )
      return
    }

    const guests = Number(
      bookingForm.guests
    )

    const maxGuests =
      Number(
        bookingHomestay.max_guests || 1
      )

    if (guests > maxGuests) {
      pushToast(
        `Maximum capacity is ${maxGuests} guests`,
        'danger'
      )
      return
    }

    const result = await addBooking({
      homestayId: bookingHomestay.homestay_id,

      travelerId: user.id,

      travelerName: user.fullName,

      checkIn: bookingForm.checkIn,

      checkOut: bookingForm.checkOut,

      guests,

      totalPrice:
        nights *
        Number(
          bookingHomestay.price_per_night_npr || 0
        ),
    })

    if (!result?.success) {
      return
    }

    closeModal()
    navigate('/bookings')
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Header */}

      <div className="text-center">

        <p className="text-sm font-medium text-terracotta-500">
          Stay local
        </p>

        <h1 className="mt-2 font-display text-3xl font-medium text-ink-900 sm:text-4xl">
          Homestays
        </h1>

        <p className="mt-2 text-sm text-ink-500">
          Discover authentic stays hosted by local families across Nepal.
        </p>

      </div>

      {/* Filters */}

      <div className="mt-8 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-end">

        <SearchBar
          value={query}
          onChange={(value) => {
            setQuery(value)
            setPage(1)
          }}
          placeholder="Search homestay, district or location…"
          className="flex-1"
        />

        <FilterSelect
          label="Sort by"
          value={sort}
          onChange={(value) => {
            setSort(value)
            setPage(1)
          }}
          options={[
            {
              value: 'rating',
              label: 'Highest rated',
            },
            {
              value: 'price-low',
              label: 'Price: low to high',
            },
            {
              value: 'price-high',
              label: 'Price: high to low',
            },
          ]}
        />

      </div>

      {/* Result count */}

      <p className="mt-6 text-sm text-ink-500">
        {loading
          ? 'Loading homestays…'
          : `${filtered.length} homestay${
              filtered.length !== 1
                ? 's'
                : ''
            } shown`}
      </p>

      {/* Cards */}

      <div className="mt-4">

        {loading ? (
          <CardSkeletonGrid count={6} />

        ) : filtered.length === 0 ? (

          <EmptyState
            icon={<FaBed />}
            title="No homestays found"
            description="Try searching for another homestay, district, or location."
          />

        ) : (

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {filtered.map((h) => (

              <HomestayCard
                key={h.homestay_id}
                homestay={h}
                onBook={() =>
                  setBookingHomestay(h)
                }
              />

            ))}

          </div>
        )}

      </div>

      {/* Pagination */}

      {!loading && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Booking modal */}

      <Modal
        isOpen={!!bookingHomestay}
        onClose={closeModal}
        title={
          bookingHomestay
            ? `Book ${bookingHomestay.homestay_name}`
            : ''
        }
      >

        {bookingHomestay && (

          <form
            onSubmit={handleConfirmBooking}
            className="flex flex-col gap-4"
          >

            {/* Homestay summary */}

            <div className="rounded-xl bg-sand-100 p-4">

              <p className="text-sm font-medium text-ink-900">
                {bookingHomestay.homestay_name}
              </p>

              <p className="mt-1 text-xs text-ink-500">
                {bookingHomestay.address ||
                  bookingHomestay.municipality ||
                  bookingHomestay.district}
              </p>

              <p className="mt-2 text-sm font-medium text-teal-700">
                NPR{' '}
                {Number(
                  bookingHomestay.price_per_night_npr || 0
                ).toLocaleString()}
                {' / night'}
              </p>

            </div>

            {/* Dates */}

            <div className="grid grid-cols-2 gap-3">

              <div>

                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  Check-in
                </label>

                <input
                  required
                  type="date"
                  value={bookingForm.checkIn}
                  onChange={(e) =>
                    setBookingForm((f) => ({
                      ...f,
                      checkIn:
                        e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-ink-900/10 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
                />

              </div>

              <div>

                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  Check-out
                </label>

                <input
                  required
                  type="date"
                  value={bookingForm.checkOut}
                  onChange={(e) =>
                    setBookingForm((f) => ({
                      ...f,
                      checkOut:
                        e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-ink-900/10 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
                />

              </div>

            </div>

            {/* Guests */}

            <div>

              <label className="mb-1.5 block text-sm font-medium text-ink-700">
                Guests
              </label>

              <input
                required
                type="number"
                min={1}
                max={
                  bookingHomestay.max_guests || 1
                }
                value={bookingForm.guests}
                onChange={(e) =>
                  setBookingForm((f) => ({
                    ...f,
                    guests:
                      e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-ink-900/10 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
              />

              <p className="mt-1 text-xs text-ink-500">
                Maximum capacity:{' '}
                {bookingHomestay.max_guests || 1}{' '}
                guests
              </p>

            </div>

            {/* Total */}

            {nights > 0 && (

              <div className="flex items-center justify-between rounded-xl bg-teal-50 p-3 text-sm">

                <span className="text-teal-700">
                  {nights} night
                  {nights > 1 ? 's' : ''}
                </span>

                <span className="font-medium text-teal-900">
                  NPR{' '}
                  {(
                    nights *
                    Number(
                      bookingHomestay.price_per_night_npr || 0
                    )
                  ).toLocaleString()}
                </span>

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
