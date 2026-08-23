import { useEffect, useRef, useState } from 'react'

import {
  FaMagic,
  FaSearch,
  FaMapMarkerAlt,
  FaChevronDown,
} from 'react-icons/fa'

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
  budget: 2000,
  duration: 4,
  travelType: 'Nature',
  region: 'Any',
  activities: [],
  month: 'October',
  travelers: 2,
}

export default function RecommendationForm() {
  const [form, setForm] = useState(initialForm)

  const [destinationOptions, setDestinationOptions] =
    useState([])

  const [selectedDestination, setSelectedDestination] =
    useState('')

  const [destinationSearch, setDestinationSearch] =
    useState('')

  const [
    showDestinationSuggestions,
    setShowDestinationSuggestions,
  ] = useState(false)

  const destinationSearchRef = useRef(null)

  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  // =====================================================
  // LOAD DESTINATIONS
  // =====================================================

  useEffect(() => {
    const loadDestinations = async () => {
      try {
        const response = await api.get('/destinations/', {
          params: {
            page: 1,
            limit: 100,
          },
        })

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.items || []

        const sortedDestinations = [...data].sort((a, b) =>
          String(a.destination_name || '').localeCompare(
            String(b.destination_name || '')
          )
        )

        setDestinationOptions(sortedDestinations)

        // IMPORTANT:
        // Do NOT automatically select a destination.
        setSelectedDestination('')
        setDestinationSearch('')
      } catch (error) {
        console.error(
          'Failed to load destinations:',
          error
        )
      }
    }

    loadDestinations()
  }, [])

  // =====================================================
  // CLOSE SEARCH WHEN CLICKING OUTSIDE
  // =====================================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        destinationSearchRef.current &&
        !destinationSearchRef.current.contains(
          event.target
        )
      ) {
        setShowDestinationSuggestions(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      )
    }
  }, [])

  // =====================================================
  // FILTER DESTINATIONS
  // =====================================================

  const searchValue =
    destinationSearch.trim().toLowerCase()

  const filteredDestinationOptions = destinationOptions
    .filter((destination) => {
      const name = String(
        destination.destination_name || ''
      ).toLowerCase()

      const district = String(
        destination.district || ''
      ).toLowerCase()

      const province = String(
        destination.province || ''
      ).toLowerCase()

      if (!searchValue) {
        return false
      }

      return (
        name.includes(searchValue) ||
        district.includes(searchValue) ||
        province.includes(searchValue)
      )
    })
    .sort((a, b) =>
      String(a.destination_name || '').localeCompare(
        String(b.destination_name || '')
      )
    )
    .slice(0, 8)

  // =====================================================
  // SELECT DESTINATION
  // =====================================================

  const selectDestination = (destination) => {
    const name = destination.destination_name

    setSelectedDestination(name)
    setDestinationSearch(name)
    setShowDestinationSuggestions(false)
  }

  // =====================================================
  // ACTIVITY TOGGLE
  // =====================================================

  const toggleActivity = (activity) => {
    setForm((current) => ({
      ...current,
      activities: current.activities.includes(activity)
        ? current.activities.filter(
            (item) => item !== activity
          )
        : [...current.activities, activity],
    }))
  }

  // =====================================================
  // AI RECOMMENDATION
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedDestination) {
      setShowDestinationSuggestions(
        Boolean(destinationSearch.trim())
      )
      return
    }

    try {
      setLoading(true)
      setResults(null)

      const response = await api.post(
        '/recommendations/',
        {
          destination_name: selectedDestination,
          top_n: 50,
        }
      )

      const recommendationData = Array.isArray(
        response.data
      )
        ? response.data
        : response.data?.results || []

      const budgetFiltered = recommendationData
        .filter(
          (destination) =>
            Number(
              destination.estimated_budget_npr || 0
            ) <= Number(form.budget)
        )
        .slice(0, 12)

      setResults(budgetFiltered)
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
    <div className="min-h-screen bg-[#F7F4EE]">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="px-5 pb-8 pt-8 sm:pt-10">

        <div className="mx-auto max-w-3xl text-center">

          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-terracotta-500/10 text-terracotta-500">
            <FaMagic size={18} />
          </div>

          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#1C2927] sm:text-4xl">
            Explore by Preferences
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#66716F] sm:text-base">
            Tell us how you want to travel and TripAI will
            find destinations that match your preferences.
          </p>

        </div>

      </section>

      {/* =====================================================
          PREFERENCE FORM
      ===================================================== */}

      <section className="px-4 pb-10 sm:px-6">

        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-6xl rounded-3xl border border-[#E6E1D8] bg-white p-5 shadow-sm sm:p-7 lg:p-8"
        >

          {/* =================================================
              REFERENCE DESTINATION
          ================================================= */}

          <div
            ref={destinationSearchRef}
            className="mx-auto max-w-3xl"
          >

            <div className="text-center">

              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-terracotta-500">
                Reference destination
              </p>

              <h2 className="mt-1 font-display text-xl font-semibold text-[#1C2927]">
                Find places similar to somewhere you know
              </h2>

              <p className="mx-auto mt-2 max-w-2xl text-sm leading-5 text-[#737D7A]">
                Search for a destination you know. TripAI
                will use it as a reference when finding
                similar destinations.
              </p>

            </div>

            <div className="relative mt-5">

              {/* SEARCH FIELD */}

              <div
                className={`flex h-12 items-center rounded-xl border bg-[#FFFCF7] transition ${
                  showDestinationSuggestions
                    ? 'border-teal-700 ring-2 ring-teal-700/10'
                    : 'border-[#DADFDc] hover:border-[#C8CFCC]'
                }`}
              >

                <FaMapMarkerAlt
                  size={14}
                  className="ml-4 shrink-0 text-terracotta-500"
                />

                <input
                  type="text"
                  value={destinationSearch}
                  onChange={(e) => {
                    const value = e.target.value

                    setDestinationSearch(value)

                    // If user edits the selected value,
                    // require another selection.
                    if (
                      value !== selectedDestination
                    ) {
                      setSelectedDestination('')
                    }

                    setShowDestinationSuggestions(
                      Boolean(value.trim())
                    )
                  }}
                  onFocus={() => {
                    if (destinationSearch.trim()) {
                      setShowDestinationSuggestions(
                        true
                      )
                    }
                  }}
                  placeholder="Search for a destination..."
                  autoComplete="off"
                  className="!m-0 min-w-0 flex-1 !border-0 !bg-transparent px-3 text-sm text-[#253330] !outline-none !ring-0 placeholder:text-[#9AA3A1] focus:!border-0 focus:!outline-none focus:!ring-0"
                />

                <button
                  type="button"
                  onClick={() => {
                    if (destinationSearch.trim()) {
                      setShowDestinationSuggestions(true)
                    }
                  }}
                  className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-terracotta-500 transition hover:bg-terracotta-500/10"
                  aria-label="Search destinations"
                >
                  <FaSearch size={13} />
                </button>

              </div>

              {/* =================================================
                  AUTOCOMPLETE
              ================================================= */}

              {showDestinationSuggestions &&
                destinationSearch.trim() && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-[#E2E6E3] bg-white shadow-xl">

                    <div className="border-b border-[#EEF0EE] px-4 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7B8582]">
                        Matching destinations
                      </p>
                    </div>

                    <div className="max-h-64 overflow-y-auto">

                      {filteredDestinationOptions.length >
                      0 ? (
                        filteredDestinationOptions.map(
                          (destination) => (
                            <button
                              key={
                                destination.destination_id
                              }
                              type="button"
                              onClick={() =>
                                selectDestination(
                                  destination
                                )
                              }
                              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#F8F5EF]"
                            >

                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terracotta-500/10 text-terracotta-500">
                                <FaMapMarkerAlt
                                  size={12}
                                />
                              </span>

                              <span className="min-w-0 flex-1">

                                <span className="block truncate text-sm font-medium text-[#253330]">
                                  {
                                    destination.destination_name
                                  }
                                </span>

                                <span className="mt-0.5 block truncate text-xs text-[#7B8582]">
                                  {
                                    destination.district
                                  }
                                  ,{' '}
                                  {
                                    destination.province
                                  }
                                </span>

                              </span>

                            </button>
                          )
                        )
                      ) : (
                        <div className="px-5 py-7 text-center">

                          <p className="text-sm font-medium text-[#35423F]">
                            No destinations found
                          </p>

                          <p className="mt-1 text-xs text-[#858F8C]">
                            Try a different destination
                            name.
                          </p>

                        </div>
                      )}

                    </div>

                  </div>
                )}

            </div>

            {/* SELECTED DESTINATION */}

            {selectedDestination && (
              <div className="mt-3 text-center">

                <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                  Using{' '}
                  <span className="ml-1 font-semibold">
                    {selectedDestination}
                  </span>
                </span>

              </div>
            )}

          </div>

          {/* =================================================
              DIVIDER
          ================================================= */}

          <div className="my-8 border-t border-[#ECE8E0]" />

          {/* =================================================
              PREFERENCES
          ================================================= */}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

            {/* BUDGET */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-[#35423F]">
                Budget
              </label>

              <input
                type="range"
                min={5000}
                max={100000}
                step={5000}
                value={form.budget}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    budget: Number(e.target.value),
                  }))
                }
                className="w-full accent-teal-700"
              />

              <p className="mt-2 text-sm font-semibold text-teal-800">
                NPR {form.budget.toLocaleString()}
              </p>

            </div>

            {/* DURATION */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-[#35423F]">
                Travel duration
              </label>

              <div className="relative">

                <input
                  type="number"
                  min={1}
                  max={30}
                  value={form.duration}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      duration: Number(
                        e.target.value
                      ),
                    }))
                  }
                  className="w-full rounded-xl border border-[#DADFDc] bg-[#FFFCF7] px-4 py-2.5 text-sm text-[#253330] outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10"
                />

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#89928F]">
                  days
                </span>

              </div>

            </div>

            {/* TRAVEL TYPE */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-[#35423F]">
                Travel style
              </label>

              <div className="relative">

                <select
                  value={form.travelType}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      travelType: e.target.value,
                    }))
                  }
                  className="w-full appearance-none rounded-xl border border-[#DADFDc] bg-[#FFFCF7] px-4 py-2.5 pr-10 text-sm text-[#253330] outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10"
                >
                  <option value="Nature">
                    Nature
                  </option>

                  <option value="Adventure">
                    Adventure
                  </option>

                  <option value="Cultural">
                    Cultural
                  </option>

                  <option value="Religious">
                    Religious
                  </option>

                  <option value="Family">
                    Family
                  </option>

                  <option value="Luxury">
                    Luxury
                  </option>
                </select>

                <FaChevronDown
                  size={10}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7B8582]"
                />

              </div>

            </div>

            {/* REGION */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-[#35423F]">
                Preferred region
              </label>

              <div className="relative">

                <select
                  value={form.region}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      region: e.target.value,
                    }))
                  }
                  className="w-full appearance-none rounded-xl border border-[#DADFDc] bg-[#FFFCF7] px-4 py-2.5 pr-10 text-sm text-[#253330] outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10"
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

                <FaChevronDown
                  size={10}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7B8582]"
                />

              </div>

            </div>

            {/* ACTIVITIES */}

            <div className="sm:col-span-2">

              <label className="mb-3 block text-sm font-semibold text-[#35423F]">
                What would you like to do?
              </label>

              <div className="flex flex-wrap gap-2">

                {activityOptions.map((activity) => {

                  const active =
                    form.activities.includes(
                      activity
                    )

                  return (
                    <button
                      type="button"
                      key={activity}
                      onClick={() =>
                        toggleActivity(activity)
                      }
                      className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
                        active
                          ? 'bg-[#173D42] text-white shadow-sm'
                          : 'bg-[#F2EDE3] text-[#4E5956] hover:bg-[#E8E1D5]'
                      }`}
                    >
                      {activity}
                    </button>
                  )
                })}

              </div>

            </div>

            {/* MONTH */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-[#35423F]">
                Travel month
              </label>

              <div className="relative">

                <select
                  value={form.month}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      month: e.target.value,
                    }))
                  }
                  className="w-full appearance-none rounded-xl border border-[#DADFDc] bg-[#FFFCF7] px-4 py-2.5 pr-10 text-sm text-[#253330] outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10"
                >
                  {months.map((month) => (
                    <option
                      key={month}
                      value={month}
                    >
                      {month}
                    </option>
                  ))}
                </select>

                <FaChevronDown
                  size={10}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7B8582]"
                />

              </div>

            </div>

            {/* TRAVELERS */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-[#35423F]">
                Number of travelers
              </label>

              <div className="relative">

                <input
                  type="number"
                  min={1}
                  max={20}
                  value={form.travelers}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      travelers: Number(
                        e.target.value
                      ),
                    }))
                  }
                  className="w-full rounded-xl border border-[#DADFDc] bg-[#FFFCF7] px-4 py-2.5 text-sm text-[#253330] outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10"
                />

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#89928F]">
                  people
                </span>

              </div>

            </div>

          </div>

          {/* =================================================
              SUBMIT
          ================================================= */}

          <div className="mt-8">

            <Button
              type="submit"
              fullWidth
              loading={loading}
              icon={<FaMagic />}
            >
              Find my destinations
            </Button>

          </div>

        </form>

      </section>

      {/* =====================================================
          RESULTS
      ===================================================== */}

      <section className="px-4 pb-16 sm:px-6">

        <div className="mx-auto max-w-7xl">

          {loading && (
            <LoadingSpinner
              label="Finding destinations that match your preferences…"
            />
          )}

          {!loading &&
            results &&
            results.length === 0 && (
              <EmptyState
                title="No strong matches found"
                description="Try another reference destination or adjust your preferences."
              />
            )}

          {!loading &&
            results &&
            results.length > 0 && (
              <>

                <div className="mx-auto mb-8 max-w-3xl text-center">

                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-terracotta-500">
                    TripAI recommendations
                  </p>

                  <h2 className="mt-2 font-display text-2xl font-semibold text-[#1C2927] sm:text-3xl">
                    Destinations chosen for you
                  </h2>

                  <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#697571]">
                    Places selected using your reference
                    destination and travel preferences.
                  </p>

                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

                  {results.map((recommendation) => (
                    <RecommendationCard
                      key={
                        recommendation.destination_id
                      }
                      recommendation={recommendation}
                    />
                  ))}

                </div>

              </>
            )}

        </div>

      </section>

    </div>
  )
}