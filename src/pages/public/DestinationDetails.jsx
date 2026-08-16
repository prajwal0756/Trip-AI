import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaWallet,
  FaCheckCircle,
  FaHeart,
  FaRegHeart,
  FaUsers,
  FaHiking,
} from 'react-icons/fa'

import StarRating from '../../components/shared/StarRating'
import HomestayCard from '../../components/cards/HomestayCard'
import ReviewCard from '../../components/cards/ReviewCard'
import Button from '../../components/shared/Button'
import EmptyState from '../../components/shared/EmptyState'

import api from '../../api/client'
import { homestays } from '../../data/homestays'
import { reviews as allReviews } from '../../data/reviews'
import { useApp } from '../../context/AppContext'

export default function DestinationDetails() {
  const { id } = useParams()

  const [destination, setDestination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState(0)

  const {
    favoriteDestinations,
    toggleFavoriteDestination,
  } = useApp()

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(`/destinations/${id}`)

        setDestination(response.data)
        setActiveImage(0)
      } catch (err) {
        console.error('Failed to load destination:', err)

        setDestination(null)
        setError(
          err.response?.data?.detail ||
          'Unable to load destination.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchDestination()
  }, [id])

  // -----------------------------------------
  // Loading
  // -----------------------------------------

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-sm text-ink-500">
            Loading destination...
          </p>
        </div>
      </div>
    )
  }

  // -----------------------------------------
  // Not found / error
  // -----------------------------------------

  if (!destination) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Destination not found"
          description={
            error ||
            'This destination may have been removed.'
          }
          action={
            <Link to="/destinations">
              <Button>
                Back to destinations
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  // -----------------------------------------
  // Normalize backend data
  // -----------------------------------------

  const destinationId = destination.destination_id

  const images = destination.images || []

  const imageUrls = images
    .map((image) => image.image_url)
    .filter(Boolean)

  const hasImages = imageUrls.length > 0

  const travelTypes = destination.travel_type
    ? destination.travel_type
        .split(',')
        .map((type) => type.trim())
        .filter(Boolean)
    : []

  const activities = destination.activities || []

  const categories = destination.categories || []

  const isFavorite =
    favoriteDestinations.includes(destinationId) ||
    favoriteDestinations.includes(String(destinationId))

  // -----------------------------------------
  // Existing local data
  // -----------------------------------------

  const nearbyHomestays = homestays.filter(
    (h) =>
      String(h.destinationId) === String(destinationId)
  )

  const destinationReviews = allReviews.filter(
    (r) =>
      r.targetType === 'destination' &&
      String(r.targetId) === String(destinationId)
  )

  // -----------------------------------------
  // Render
  // -----------------------------------------

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

      {/* =====================================
          IMAGE / PLACEHOLDER
      ===================================== */}

      <div className="overflow-hidden rounded-2xl">

        {hasImages ? (
          <img
            src={imageUrls[activeImage]}
            alt={destination.destination_name}
            className="h-72 w-full object-cover sm:h-96"
          />
        ) : (
          /*
           * Temporary placeholder until destination
           * images are available.
           */
          <div className="relative flex h-72 items-center justify-center overflow-hidden bg-gradient-to-br from-[#173446] via-[#102631] to-[#0B1117] sm:h-96">

            {/* Decorative glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(225,123,72,0.18),_transparent_60%)]" />

            {/* Subtle border */}
            <div className="absolute inset-0 rounded-2xl border border-white/10" />

            {/* Placeholder content */}
            <div className="relative z-10 px-6 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-terracotta-500/15 ring-1 ring-terracotta-400/20">
                <FaMapMarkerAlt
                  className="text-terracotta-400"
                  size={26}
                />
              </div>

              <p className="mt-5 font-display text-2xl font-semibold text-white">
                {destination.destination_name}
              </p>

              <p className="mt-2 text-sm text-slate-300">
                {destination.district}, {destination.province}
              </p>

              <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Destination
              </p>

            </div>
          </div>
        )}
      </div>

      {/* Image thumbnails */}

      {imageUrls.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto">
          {imageUrls.map((img, index) => (
            <button
              key={`${img}-${index}`}
              onClick={() => setActiveImage(index)}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${
                activeImage === index
                  ? 'border-teal-500'
                  : 'border-transparent'
              }`}
            >
              <img
                src={img}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="mt-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">

        <div>

          <h1 className="font-display text-3xl font-medium text-white">
            {destination.destination_name}
          </h1>

          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
            <FaMapMarkerAlt size={12} />

            {destination.district}, {destination.province}
          </p>

          <div className="mt-2">
            <StarRating
              rating={Number(destination.average_rating || 0)}
              reviewCount={Number(destination.review_count || 0)}
            />
          </div>

        </div>

        <button
          onClick={() =>
            toggleFavoriteDestination(destinationId)
          }
          className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-terracotta-400 transition-colors hover:bg-white/5"
        >
          {isFavorite ? (
            <FaHeart />
          ) : (
            <FaRegHeart />
          )}

          {isFavorite ? 'Saved' : 'Save'}
        </button>

      </div>

      {/* =====================================
          QUICK FACTS
      ===================================== */}

      <div className="mt-6 flex flex-wrap gap-4 rounded-2xl bg-[#121C27] p-5 shadow-sm">

        <div className="flex items-center gap-2 text-sm text-slate-300">
          <FaWallet className="text-teal-500" />

          Est. budget:

          <span className="font-medium text-white">
            NPR{' '}
            {Number(
              destination.estimated_budget_npr || 0
            ).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-300">
          <FaCalendarAlt className="text-teal-500" />

          Best time:

          <span className="font-medium text-white">
            {destination.best_season || 'Year-round'}
          </span>
        </div>

        {destination.average_duration_days && (
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <FaCalendarAlt className="text-teal-500" />

            Duration:

            <span className="font-medium text-white">
              {destination.average_duration_days} days
            </span>
          </div>
        )}

        {destination.family_friendly !== undefined &&
          destination.family_friendly !== null && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <FaUsers className="text-teal-500" />

              Family friendly:

              <span className="font-medium text-white">
                {String(destination.family_friendly)}
              </span>
            </div>
          )}

      </div>

      {/* =====================================
          TRAVEL TYPES
      ===================================== */}

      {travelTypes.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">

          {travelTypes.map((type) => (
            <span
              key={type}
              className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700"
            >
              {type}
            </span>
          ))}

        </div>
      )}

      {/* =====================================
          CATEGORIES
      ===================================== */}

      {categories.length > 0 && (
        <div className="mt-6">

          <h2 className="font-display text-xl font-medium text-white">
            Categories
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">

            {categories.map((category) => (
              <span
                key={category.category_id}
                className="rounded-full bg-sand-200 px-3 py-1.5 text-xs font-medium text-ink-700"
              >
                {category.category}
              </span>
            ))}

          </div>

        </div>
      )}

      {/* =====================================
          ABOUT
      ===================================== */}

      <div className="mt-8">

        <h2 className="font-display text-xl font-medium text-white">
          About {destination.destination_name}
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          {destination.description ||
            'Explore this destination and discover what makes it special.'}
        </p>

      </div>

      {/* =====================================
          ACTIVITIES
      ===================================== */}

      {activities.length > 0 && (
        <div className="mt-8">

          <h2 className="font-display text-xl font-medium text-white">
            Things to do
          </h2>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">

            {activities.map((activity) => (
              <div
                key={activity.activity_id}
                className="rounded-xl bg-[#121C27] p-4 shadow-sm"
              >

                <div className="flex items-center gap-2">

                  <FaCheckCircle
                    className="shrink-0 text-emerald-500"
                    size={14}
                  />

                  <span className="text-sm font-medium text-white">
                    {activity.activities}
                  </span>

                </div>

                {activity.difficulty_level && (
                  <p className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                    <FaHiking size={11} />

                    Difficulty:

                    <span className="font-medium text-slate-300">
                      {activity.difficulty_level}
                    </span>
                  </p>
                )}

              </div>
            ))}

          </div>

        </div>
      )}

      {/* =====================================
          LOCATION
      ===================================== */}

      <div className="mt-8">

        <h2 className="font-display text-xl font-medium text-white">
          Location
        </h2>

        <div className="relative mt-3 flex h-56 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#173446] via-[#102631] to-[#0B1117] text-sm text-slate-300">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(225,123,72,0.12),_transparent_65%)]" />

          <div className="relative z-10 flex flex-col items-center text-center">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta-500/15">
              <FaMapMarkerAlt
                className="text-terracotta-400"
                size={20}
              />
            </div>

            <p className="mt-3 font-medium text-white">
              {destination.destination_name}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {destination.district}, {destination.province}
            </p>

          </div>

        </div>

      </div>

      {/* =====================================
          NEARBY HOMESTAYS
      ===================================== */}

      <div className="mt-10">

        <h2 className="font-display text-xl font-medium text-white">
          Nearby homestays
        </h2>

        {nearbyHomestays.length === 0 ? (

          <p className="mt-3 text-sm text-slate-400">
            No homestays listed near this destination yet.
          </p>

        ) : (

          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">

            {nearbyHomestays.map((homestay) => (
              <HomestayCard
                key={homestay.id}
                homestay={homestay}
              />
            ))}

          </div>

        )}

      </div>

      {/* =====================================
          REVIEWS
      ===================================== */}

      <div className="mt-10">

        <h2 className="font-display text-xl font-medium text-white">
          Traveler reviews
        </h2>

        {destinationReviews.length === 0 ? (

          <p className="mt-3 text-sm text-slate-400">
            No reviews yet for this destination.
          </p>

        ) : (

          <div className="mt-4 flex flex-col gap-3">

            {destinationReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
              />
            ))}

          </div>

        )}

      </div>

      {/* =====================================
          BOOK CTA
      ===================================== */}

      <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl bg-teal-900 p-8 text-center">

        <h3 className="font-display text-xl font-medium text-white">
          Ready to visit {destination.destination_name}?
        </h3>

        <Link to="/homestays">
          <Button>
            Book a nearby homestay
          </Button>
        </Link>

      </div>

    </div>
  )
}