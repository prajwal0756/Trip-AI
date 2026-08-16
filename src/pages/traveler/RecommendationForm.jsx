import { useEffect, useState } from 'react'
import { FaMagic } from 'react-icons/fa'
import Button from '../../components/shared/Button'
import RecommendationCard from '../../components/cards/RecommendationCard'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import EmptyState from '../../components/shared/EmptyState'
import api from '../../api/client'

const activityOptions = [
  'hiking',
  'food',
  'culture',
  'wildlife',
  'relaxation',
]

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const initialForm = {
  budget: 250,
  duration: 4,
  travelType: 'Nature',
  region: 'Any',
  activities: [],
  month: 'October',
  travelers: 2,
}

export default function RecommendationForm() {
  const [form, setForm] = useState(initialForm)

  const [destinationOptions, setDestinationOptions] = useState([])
  const [selectedDestination, setSelectedDestination] = useState('')

  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  // ---------------------------------------------
  // Load real destinations from backend
  // ---------------------------------------------

  useEffect(() => {
    const loadDestinations = async () => {
      try {
        const response = await api.get('/destinations/', {
          params: {
            page: 1,
            limit: 100,
          },
        })

        setDestinationOptions(response.data)

        if (response.data.length > 0) {
          setSelectedDestination(
            response.data[0].destination_name
          )
        }
      } catch (error) {
        console.error(
          'Failed to load destinations:',
          error
        )
      }
    }

    loadDestinations()
  }, [])

  // ---------------------------------------------
  // Activity toggle
  // ---------------------------------------------

  const toggleActivity = (activity) => {
    setForm((f) => ({
      ...f,
      activities: f.activities.includes(activity)
        ? f.activities.filter((a) => a !== activity)
        : [...f.activities, activity],
    }))
  }

  // ---------------------------------------------
  // AI Recommendation
  // ---------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedDestination) {
      return
    }

    try {
      setLoading(true)
      setResults(null)

      const response = await api.post(
        '/recommendations/',
        {
          destination_name: selectedDestination,
          top_n: 6,
        }
      )

      setResults(response.data)
    } catch (error) {
      console.error(
        'Failed to get recommendations:',
        error
      )

      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>

      {/* -----------------------------------------
          Header
      ----------------------------------------- */}

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-terracotta-500/10 text-terracotta-500">
          <FaMagic size={18} />
        </div>

        <div>
          <h1 className="font-display text-2xl font-medium text-ink-900">
            AI Recommendation
          </h1>

          <p className="text-sm text-ink-500">
            Choose a destination and TripAI will find similar destinations.
          </p>
        </div>
      </div>

      {/* -----------------------------------------
          Form
      ----------------------------------------- */}

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid grid-cols-1 gap-5 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2"
      >

        {/* Starting destination */}

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            Starting destination
          </label>

          <select
            value={selectedDestination}
            onChange={(e) =>
              setSelectedDestination(e.target.value)
            }
            className="w-full rounded-xl border border-ink-900/10 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
          >
            {destinationOptions.map((destination) => (
              <option
                key={destination.destination_id}
                value={destination.destination_name}
              >
                {destination.destination_name}
              </option>
            ))}
          </select>
        </div>

        {/* Budget */}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            Budget (USD)
          </label>

          <input
            type="range"
            min={50}
            max={600}
            step={10}
            value={form.budget}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                budget: Number(e.target.value),
              }))
            }
            className="w-full accent-teal-700"
          />

          <p className="mt-1 text-sm font-medium text-teal-900">
            ${form.budget}
          </p>
        </div>

        {/* Duration */}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            Travel duration (days)
          </label>

          <input
            type="number"
            min={1}
            max={30}
            value={form.duration}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                duration: Number(e.target.value),
              }))
            }
            className="w-full rounded-xl border border-ink-900/10 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Travel type */}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            Travel type
          </label>

          <select
            value={form.travelType}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                travelType: e.target.value,
              }))
            }
            className="w-full rounded-xl border border-ink-900/10 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
          >
            <option value="Nature">Nature</option>
            <option value="Adventure">Adventure</option>
            <option value="Cultural">Cultural</option>
            <option value="Religious">Religious</option>
            <option value="Family">Family</option>
            <option value="Luxury">Luxury</option>
          </select>
        </div>

        {/* Region */}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            Preferred region
          </label>

          <select
            value={form.region}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                region: e.target.value,
              }))
            }
            className="w-full rounded-xl border border-ink-900/10 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
          >
            <option value="Any">
              Any region
            </option>

            <option value="Gandaki">
              Gandaki
            </option>

            <option value="Bagmati">
              Bagmati
            </option>

            <option value="Lumbini">
              Lumbini
            </option>

            <option value="Koshi">
              Koshi
            </option>

            <option value="Karnali">
              Karnali
            </option>

            <option value="Sudurpashchim">
              Sudurpashchim
            </option>

            <option value="Madhesh">
              Madhesh
            </option>
          </select>
        </div>

        {/* Activities */}

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-ink-700">
            Preferred activities
          </label>

          <div className="flex flex-wrap gap-2">
            {activityOptions.map((a) => (
              <button
                type="button"
                key={a}
                onClick={() => toggleActivity(a)}
                className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  form.activities.includes(a)
                    ? 'bg-teal-900 text-white'
                    : 'bg-sand-200 text-ink-700 hover:bg-sand-200/70'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Month */}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            Travel month
          </label>

          <select
            value={form.month}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                month: e.target.value,
              }))
            }
            className="w-full rounded-xl border border-ink-900/10 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Travelers */}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            Number of travelers
          </label>

          <input
            type="number"
            min={1}
            max={20}
            value={form.travelers}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                travelers: Number(e.target.value),
              }))
            }
            className="w-full rounded-xl border border-ink-900/10 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Submit */}

        <div className="sm:col-span-2">
          <Button
            type="submit"
            fullWidth
            loading={loading}
            icon={<FaMagic />}
          >
            Get recommendations
          </Button>
        </div>

      </form>

      {/* -----------------------------------------
          Results
      ----------------------------------------- */}

      <div className="mt-10">

        {loading && (
          <LoadingSpinner
            label="Matching destinations to your preferences…"
          />
        )}

        {!loading &&
          results &&
          results.length === 0 && (
            <EmptyState
              title="No strong matches found"
              description="Try another starting destination."
            />
          )}

        {!loading &&
          results &&
          results.length > 0 && (
            <>
              <h2 className="font-display text-lg font-medium text-ink-900">
                Recommended for you
              </h2>

              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

                {results.map((r) => (
                  <RecommendationCard
                    key={r.destination_id}
                    recommendation={r}
                  />
                ))}

              </div>
            </>
          )}

      </div>

    </div>
  )
}