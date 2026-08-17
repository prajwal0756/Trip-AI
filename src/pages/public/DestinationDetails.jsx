import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaMountain,
  FaStar,
} from 'react-icons/fa'

import api from '../../api/client'
import HomestayCard from '../../components/cards/HomestayCard'
import StarRating from '../../components/shared/StarRating'
import { CardSkeletonGrid } from '../../components/shared/SkeletonLoader'

export default function DestinationDetails() {
  const { id } = useParams()

  const [destination, setDestination] = useState(null)
  const [homestays, setHomestays] = useState([])

  const [loading, setLoading] = useState(true)
  const [homestayLoading, setHomestayLoading] = useState(true)
  const [error, setError] = useState('')

  // =====================================================
  // LOAD DESTINATION DETAILS
  // =====================================================

  useEffect(() => {
    const loadDestination = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(
          `/destinations/${id}`
        )

        setDestination(response.data)

      } catch (err) {
        console.error(
          'Failed to load destination:',
          err
        )

        setError(
          err.response?.data?.detail ||
          'Unable to load destination.'
        )

      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadDestination()
    }
  }, [id])

  // =====================================================
  // LOAD HOMESTAYS FROM SAME DISTRICT
  // =====================================================

  useEffect(() => {
    const loadHomestays = async () => {
      if (!destination?.district) {
        setHomestayLoading(false)
        return
      }

      try {
        setHomestayLoading(true)

        const response = await api.get(
          '/homestays/district/' +
            encodeURIComponent(
              destination.district
            ),
          {
            params: {
              limit: 6,
            },
          }
        )

        setHomestays(response.data || [])

      } catch (err) {
        console.error(
          'Failed to load homestays:',
          err
        )

        setHomestays([])

      } finally {
        setHomestayLoading(false)
      }
    }

    loadHomestays()
  }, [destination])

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="h-8 w-32 animate-pulse rounded bg-sand-200 dark:bg-white/10" />

        <div className="mt-6 h-[420px] animate-pulse rounded-3xl bg-sand-200 dark:bg-white/10" />

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="h-24 animate-pulse rounded-2xl bg-sand-200 dark:bg-white/10" />
          <div className="h-24 animate-pulse rounded-2xl bg-sand-200 dark:bg-white/10" />
          <div className="h-24 animate-pulse rounded-2xl bg-sand-200 dark:bg-white/10" />
        </div>

      </div>
    )
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !destination) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-terracotta-500/10">
          <FaMapMarkerAlt
            size={24}
            className="text-terracotta-500"
          />
        </div>

        <h1 className="mt-5 font-display text-2xl font-semibold text-[#10263A] dark:text-[#F5F3EE]">
          Destination not found
        </h1>

        <p className="mt-2 text-sm text-ink-500 dark:text-[#AAB5C0]">
          {error ||
            'We could not find this destination.'}
        </p>

        <Link
          to="/destinations"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-terracotta-500 px-5 py-3 text-sm font-medium text-white hover:bg-terracotta-600"
        >
          <FaArrowLeft size={12} />
          Back to destinations
        </Link>

      </div>
    )
  }

  // =====================================================
  // NORMALIZE DATA
  // =====================================================

  const name =
    destination.destination_name ||
    destination.name ||
    'Destination'

  const province =
    destination.province || ''

  const district =
    destination.district || ''

  const description =
    destination.description ||
    'Discover this beautiful destination in Nepal.'

  const rating =
    Number(destination.average_rating || 0)

  const reviewCount =
    Number(destination.review_count || 0)

  const budget =
    Number(
      destination.estimated_budget_npr || 0
    )

  const popularity =
    Number(
      destination.popularity_score || 0
    )

  const latitude =
    destination.latitude

  const longitude =
    destination.longitude

  const duration =
    destination.average_duration_days

  const difficulty =
    destination.difficulty_level

  const familyFriendly =
    destination.family_friendly

  const travelTypes = destination.travel_type
    ? String(destination.travel_type)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : []

  const categories =
    destination.categories || []

  const activities =
    destination.activities || []

  const images =
    destination.images || []

  const imageUrl =
    images.length > 0
      ? images[0].image_url
      : null

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* =====================================================
          BACK
      ===================================================== */}

      <Link
        to="/destinations"
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors hover:text-terracotta-500 dark:text-[#AAB5C0]"
      >
        <FaArrowLeft size={12} />
        Back to destinations
      </Link>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="mt-5 overflow-hidden rounded-3xl border border-navy-900/10 bg-[#FFFCF7] shadow-sm dark:border-white/10 dark:bg-[#121C27]">

        <div className="relative h-[300px] sm:h-[400px]">

          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display =
                  'none'
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#102D3B] via-[#123E43] to-[#0B1C28]">

              <div className="flex flex-col items-center text-center">

                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/10">
                  <FaMountain
                    size={34}
                    className="text-white/70"
                  />
                </div>

                <p className="text-base font-medium text-white/70">
                  Destination image
                </p>

                <p className="mt-1 text-sm text-white/40">
                  Coming soon
                </p>

              </div>

            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">

            <div className="flex flex-wrap items-center gap-2">

              {province && (
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                  {province}
                </span>
              )}

              {district && (
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                  {district}
                </span>
              )}

            </div>

            <h1 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              {name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/85">

              {district && (
                <span className="flex items-center gap-1.5">
                  <FaMapMarkerAlt
                    size={12}
                  />
                  {district}, {province}
                </span>
              )}

              <StarRating
                rating={rating}
                reviewCount={reviewCount}
              />

            </div>

          </div>

        </div>

        {/* =====================================================
            QUICK INFORMATION
        ===================================================== */}

        <div className="grid grid-cols-2 divide-x divide-y border-t border-navy-900/10 dark:divide-white/10 dark:border-white/10 sm:grid-cols-4 sm:divide-y-0">

          <div className="p-5">
            <p className="text-xs text-ink-500 dark:text-[#AAB5C0]">
              Estimated budget
            </p>

            <p className="mt-1 font-semibold text-[#10263A] dark:text-[#F5F3EE]">
              NPR {budget.toLocaleString()}
            </p>
          </div>

          <div className="p-5">
            <p className="text-xs text-ink-500 dark:text-[#AAB5C0]">
              Duration
            </p>

            <p className="mt-1 font-semibold text-[#10263A] dark:text-[#F5F3EE]">
              {duration
                ? `${duration} days`
                : 'Not specified'}
            </p>
          </div>

          <div className="p-5">
            <p className="text-xs text-ink-500 dark:text-[#AAB5C0]">
              Difficulty
            </p>

            <p className="mt-1 font-semibold text-[#10263A] dark:text-[#F5F3EE]">
              {difficulty ||
                'Not specified'}
            </p>
          </div>

          <div className="p-5">
            <p className="text-xs text-ink-500 dark:text-[#AAB5C0]">
              Rating
            </p>

            <p className="mt-1 flex items-center gap-1.5 font-semibold text-[#10263A] dark:text-[#F5F3EE]">
              <FaStar
                size={13}
                className="text-amber-500"
              />
              {rating.toFixed(1)}
            </p>
          </div>

        </div>

      </section>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">

        {/* LEFT */}
        <div>

          {/* ABOUT */}

          <section className="rounded-2xl border border-navy-900/10 bg-[#FFFCF7] p-6 dark:border-white/10 dark:bg-[#121C27]">

            <h2 className="font-display text-2xl font-semibold text-[#10263A] dark:text-[#F5F3EE]">
              About {name}
            </h2>

            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-ink-600 dark:text-[#AAB5C0]">
              {description}
            </p>

          </section>

          {/* TRAVEL TYPES */}

          {travelTypes.length > 0 && (
            <section className="mt-6">

              <h2 className="font-display text-xl font-semibold text-[#10263A] dark:text-[#F5F3EE]">
                Travel types
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">

                {travelTypes.map(
                  (type) => (
                    <span
                      key={type}
                      className="rounded-lg bg-sand-200/70 px-3 py-2 text-sm font-medium text-[#10263A] dark:bg-white/10 dark:text-[#AAB5C0]"
                    >
                      {type}
                    </span>
                  )
                )}

              </div>

            </section>
          )}

          {/* CATEGORIES */}

          {categories.length > 0 && (
            <section className="mt-6">

              <h2 className="font-display text-xl font-semibold text-[#10263A] dark:text-[#F5F3EE]">
                Categories
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">

                {categories.map(
                  (category) => (
                    <span
                      key={
                        category.category_id ||
                        category.category
                      }
                      className="rounded-lg bg-teal-500/10 px-3 py-2 text-sm font-medium text-teal-700 dark:text-teal-300"
                    >
                      {category.category}
                    </span>
                  )
                )}

              </div>

            </section>
          )}

          {/* ACTIVITIES */}

  

          {activities.length > 0 && (
            <section className="mt-6">

              <h2 className="font-display text-xl font-semibold text-[#10263A] dark:text-[#F5F3EE]">
                Activities
              </h2>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">

                {activities.map((activity) => (
                  <div
                    key={
                      activity.activity_id ||
                      activity.activities
                    }
                    className="rounded-xl border border-navy-900/10 bg-[#FFFCF7] p-3 text-sm text-[#10263A] dark:border-white/10 dark:bg-[#121C27] dark:text-[#F5F3EE]"
                  >
                    {activity.activities ||
                      activity.activity ||
                      'Activity'}
                  </div>
                ))}

              </div>

            </section>
          )}

        </div>

        {/* RIGHT SIDEBAR */}

        <aside>

          <div className="sticky top-6 rounded-2xl border border-navy-900/10 bg-[#FFFCF7] p-6 dark:border-white/10 dark:bg-[#121C27]">

            <h2 className="font-display text-xl font-semibold text-[#10263A] dark:text-[#F5F3EE]">
              Plan your visit
            </h2>

            <div className="mt-5 space-y-4">

              {familyFriendly && (
                <div>
                  <p className="text-xs text-ink-500 dark:text-[#AAB5C0]">
                    Family friendly
                  </p>

                  <p className="mt-1 text-sm font-medium text-[#10263A] dark:text-[#F5F3EE]">
                    {familyFriendly}
                  </p>
                </div>
              )}

              {popularity > 0 && (
                <div>
                  <p className="text-xs text-ink-500 dark:text-[#AAB5C0]">
                    Popularity score
                  </p>

                  <p className="mt-1 text-sm font-medium text-[#10263A] dark:text-[#F5F3EE]">
                    {popularity.toFixed(0)}
                  </p>
                </div>
              )}

              {latitude &&
                longitude && (
                  <div>
                    <p className="text-xs text-ink-500 dark:text-[#AAB5C0]">
                      Coordinates
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#10263A] dark:text-[#F5F3EE]">
                      {Number(latitude).toFixed(
                        4
                      )}
                      ,{' '}
                      {Number(longitude).toFixed(
                        4
                      )}
                    </p>
                  </div>
                )}

            </div>

          </div>

        </aside>

      </div>

      {/* =====================================================
          HOMESTAYS
      ===================================================== */}

      <section className="mt-12">

        <div className="flex items-end justify-between gap-4">

          <div>

            <p className="text-xs font-semibold uppercase tracking-wider text-terracotta-500">
              Stay nearby
            </p>

            <h2 className="mt-1 font-display text-2xl font-semibold text-[#10263A] dark:text-[#F5F3EE]">
              Homestays in {district}
            </h2>

            <p className="mt-1 text-sm text-ink-500 dark:text-[#AAB5C0]">
              Recommended homestays in the same district.
            </p>

          </div>

          <Link
            to={`/homestays?district=${encodeURIComponent(
              district
            )}`}
            className="hidden text-sm font-medium text-terracotta-500 hover:text-terracotta-600 sm:block"
          >
            View all →
          </Link>

        </div>

        <div className="mt-6">

          {homestayLoading ? (
            <CardSkeletonGrid count={3} />
          ) : homestays.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-navy-900/15 p-8 text-center dark:border-white/15">

              <p className="text-sm text-ink-500 dark:text-[#AAB5C0]">
                No homestays are currently available in this district.
              </p>

            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {homestays.map(
                (homestay) => (
                  <HomestayCard
                    key={
                      homestay.homestay_id
                    }
                    homestay={{
                      id:
                        homestay.homestay_id,
                      name:
                        homestay.homestay_name,
                      location:
                        homestay.address ||
                        homestay.municipality ||
                        homestay.district,
                      ownerName:
                        homestay.municipality ||
                        'Local host',
                      rating:
                        Number(
                          homestay.rating || 0
                        ),
                      reviewCount:
                        Number(
                          homestay.review_count ||
                            0
                        ),
                      amenities:
                        homestay.amenities
                          ? String(
                              homestay.amenities
                            )
                              .split(',')
                              .map(
                                (item) =>
                                  item.trim()
                              )
                              .filter(Boolean)
                          : [],
                      price:
                        Number(
                          homestay.price_per_night_npr ||
                            0
                        ),
                      availability:
                        'Available',
                      image: null,
                    }}
                  />
                )
              )}

            </div>
          )}

        </div>

      </section>

    </div>
  )
}
