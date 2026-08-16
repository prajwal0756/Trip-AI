import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FaMapMarkedAlt } from 'react-icons/fa'
import DestinationCard from '../../components/cards/DestinationCard'
import SearchBar from '../../components/shared/SearchBar'
import FilterSelect from '../../components/shared/FilterSelect'
import Pagination from '../../components/shared/Pagination'
import EmptyState from '../../components/shared/EmptyState'
import { CardSkeletonGrid } from '../../components/shared/SkeletonLoader'
import { useDelayedLoading } from '../../hooks/useDelayedLoading'
import api from '../../api/client'

const PAGE_SIZE = 6

export default function Destinations() {
  const [searchParams] = useSearchParams()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [travelType, setTravelType] = useState('All')
  const [region, setRegion] = useState('All')
  const [sort, setSort] = useState('rating')
  const [page, setPage] = useState(1)

  const [destinations, setDestinations] = useState([])
  const [totalDestinations, setTotalDestinations] = useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const delayedLoading = useDelayedLoading([
    query,
    travelType,
    region,
    sort,
  ])

  // ---------------------------------------------
  // Load destinations from FastAPI
  // ---------------------------------------------

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true)
        setError('')

        const [destinationsResponse, statisticsResponse] =
          await Promise.all([
            api.get('/destinations/', {
              params: {
                page,
                limit: PAGE_SIZE,
              },
            }),

            api.get('/destinations/statistics'),
          ])

        const mappedDestinations =
          destinationsResponse.data.map((destination) => ({
            id: String(destination.destination_id),
            name: destination.destination_name,
            region: destination.province,
            rating: Number(destination.average_rating || 0),
            reviewCount: destination.review_count || 0,
            description: destination.description || '',
            image: null,

            travelType: destination.travel_type
              ? destination.travel_type
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean)
              : [],

            estimatedBudget:
              destination.estimated_budget_npr || 0,
          }))

        setDestinations(mappedDestinations)

        setTotalDestinations(
          statisticsResponse.data.total_destinations || 0
        )
      } catch (err) {
        console.error('Failed to load destinations:', err)
        setError('Unable to load destinations.')
      } finally {
        setLoading(false)
      }
    }

    fetchDestinations()
  }, [page])

  // ---------------------------------------------
  // Filter options
  // ---------------------------------------------

  const travelTypes = [
    ...new Set(
      destinations.flatMap(
        (destination) => destination.travelType
      )
    ),
  ]

  const regions = [
    ...new Set(
      destinations.map(
        (destination) => destination.region
      )
    ),
  ]

  // ---------------------------------------------
  // Search + filtering + sorting
  // ---------------------------------------------

  let filtered = destinations.filter((destination) => {
    const matchesQuery =
      !query ||
      destination.name
        .toLowerCase()
        .includes(query.toLowerCase()) ||
      destination.region
        .toLowerCase()
        .includes(query.toLowerCase())

    const matchesType =
      travelType === 'All' ||
      destination.travelType.includes(travelType)

    const matchesRegion =
      region === 'All' ||
      destination.region === region

    return (
      matchesQuery &&
      matchesType &&
      matchesRegion
    )
  })

  if (sort === 'rating') {
    filtered = [...filtered].sort(
      (a, b) => b.rating - a.rating
    )
  }

  if (sort === 'budget-low') {
    filtered = [...filtered].sort(
      (a, b) =>
        a.estimatedBudget -
        b.estimatedBudget
    )
  }

  if (sort === 'budget-high') {
    filtered = [...filtered].sort(
      (a, b) =>
        b.estimatedBudget -
        a.estimatedBudget
    )
  }

  // ---------------------------------------------
  // Backend pagination
  // ---------------------------------------------

  const totalPages = Math.max(
    1,
    Math.ceil(totalDestinations / PAGE_SIZE)
  )

  // ---------------------------------------------
  // Reset page when filters change
  // ---------------------------------------------

  const handleFilterChange = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  // ---------------------------------------------
  // UI
  // ---------------------------------------------

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      <div className="text-center">
        <p className="text-sm font-medium text-terracotta-500">
          Explore Nepal
        </p>

        <h1 className="mt-2 font-display text-3xl font-medium text-ink-900 sm:text-4xl">
          Destinations
        </h1>

        <p className="mt-2 text-sm text-ink-500">
          Browse by region, travel style, or budget.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-end">

        <SearchBar
          value={query}
          onChange={handleFilterChange(setQuery)}
          placeholder="Search destinations or regions…"
          className="flex-1"
        />

        <FilterSelect
          label="Travel type"
          value={travelType}
          onChange={handleFilterChange(setTravelType)}
          options={['All', ...travelTypes]}
        />

        <FilterSelect
          label="Region"
          value={region}
          onChange={handleFilterChange(setRegion)}
          options={['All', ...regions]}
        />

        <FilterSelect
          label="Sort by"
          value={sort}
          onChange={setSort}
          options={[
            {
              value: 'rating',
              label: 'Highest rated',
            },
            {
              value: 'budget-low',
              label: 'Budget: low to high',
            },
            {
              value: 'budget-high',
              label: 'Budget: high to low',
            },
          ]}
        />

      </div>

      {error ? (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      ) : (
        <p className="mt-6 text-sm text-ink-500">
          {totalDestinations} destination
          {totalDestinations !== 1 ? 's' : ''} found
        </p>
      )}

      <div className="mt-4">

        {loading || delayedLoading ? (
          <CardSkeletonGrid count={6} />

        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FaMapMarkedAlt />}
            title="No destinations match your filters"
            description="Try adjusting your search or clearing a filter."
          />

        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {filtered.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
              />
            ))}

          </div>
        )}

      </div>

      {!loading && !delayedLoading && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

    </div>
  )
}