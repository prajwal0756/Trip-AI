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
          IMAGE
      ===================================== */}

      <div className="overflow-hidden rounded-2xl bg-sand-100">

        {hasImages ? (
          <img
            src={imageUrls[activeImage]}
            alt={destination.destination_name}
            className="h-72 w-full object-cover sm:h-96"
          />
        ) : (
          <div className="flex h-72 items-center justify-center sm:h-96">
            <div className="text-center">
              <FaMapMarkerAlt
                className="mx-auto text-3xl text-terracotta-500"
              />

              <p className="mt-3 font-display text-xl font-medium text-ink-900">
                {destination.destination_name}
              </p>

              <p className="mt-1 text-sm text-ink-500">
                {destination.district}, {destination.province}
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

          <h1 className="font-display text-3xl font-medium text-ink-900">
            {destination.destination_name}
          </h1>

          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
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
          className="flex items-center gap-2 rounded-xl border border-ink-900/10 px-4 py-2.5 text-sm font-medium text-terracotta-500 hover:bg-sand-100"
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

      <div className="mt-6 flex flex-wrap gap-4 rounded-2xl bg-white p-5 shadow-sm">

        <div className="flex items-center gap-2 text-sm text-ink-700">
          <FaWallet className="text-teal-700" />

          Est. budget:

          <span className="font-medium">
            NPR{' '}
            {Number(
              destination.estimated_budget_npr || 0
            ).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-ink-700">
          <FaCalendarAlt className="text-teal-700" />

          Best time:

          <span className="font-medium">
            {destination.best_season || 'Year-round'}
          </span>
        </div>

        {destination.average_duration_days && (
          <div className="flex items-center gap-2 text-sm text-ink-700">
            <FaCalendarAlt className="text-teal-700" />

            Duration:

            <span className="font-medium">
              {destination.average_duration_days} days
            </span>
          </div>
        )}

        {destination.family_friendly !== undefined &&
          destination.family_friendly !== null && (
            <div className="flex items-center gap-2 text-sm text-ink-700">
              <FaUsers className="text-teal-700" />

              Family friendly:

              <span className="font-medium">
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

          <h2 className="font-display text-xl font-medium text-ink-900">
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

        <h2 className="font-display text-xl font-medium text-ink-900">
          About {destination.destination_name}
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-ink-700">
          {destination.description ||
            'Explore this destination and discover what makes it special.'}
        </p>

      </div>

      {/* =====================================
          ACTIVITIES
      ===================================== */}

      {activities.length > 0 && (
        <div className="mt-8">

          <h2 className="font-display text-xl font-medium text-ink-900">
            Things to do
          </h2>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">

            {activities.map((activity) => (
              <div
                key={activity.activity_id}
                className="rounded-xl bg-white p-4 shadow-sm"
              >

                <div className="flex items-center gap-2">

                  <FaCheckCircle
                    className="shrink-0 text-forest-500"
                    size={14}
                  />

                  <span className="text-sm font-medium text-ink-900">
                    {activity.activities}
                  </span>

                </div>

                {activity.difficulty_level && (
                  <p className="mt-2 flex items-center gap-2 text-xs text-ink-500">
                    <FaHiking size={11} />

                    Difficulty:
                    <span className="font-medium">
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

        <h2 className="font-display text-xl font-medium text-ink-900">
          Location
        </h2>

        <div className="mt-3 flex h-56 items-center justify-center rounded-2xl bg-sand-200 text-sm text-ink-500">

          <FaMapMarkerAlt className="mr-2" />

          {destination.destination_name},{' '}
          {destination.district},{' '}
          {destination.province}

        </div>

      </div>

      {/* =====================================
          NEARBY HOMESTAYS
      ===================================== */}

      <div className="mt-10">

        <h2 className="font-display text-xl font-medium text-ink-900">
          Nearby homestays
        </h2>

        {nearbyHomestays.length === 0 ? (

          <p className="mt-3 text-sm text-ink-500">
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

        <h2 className="font-display text-xl font-medium text-ink-900">
          Traveler reviews
        </h2>

        {destinationReviews.length === 0 ? (

          <p className="mt-3 text-sm text-ink-500">
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