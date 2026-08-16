import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FaMapMarkerAlt, FaCalendarAlt, FaWallet, FaCheckCircle, FaHeart, FaRegHeart } from 'react-icons/fa'
import StarRating from '../../components/shared/StarRating'
import HomestayCard from '../../components/cards/HomestayCard'
import ReviewCard from '../../components/cards/ReviewCard'
import Button from '../../components/shared/Button'
import EmptyState from '../../components/shared/EmptyState'
// import { destinations } from '../../data/destinations.json'
import destinations from '../../data/destinations.json'
import { homestays } from '../../data/homestays'
import { reviews as allReviews } from '../../data/reviews'
import { useApp } from '../../context/AppContext'

export default function DestinationDetails() {
  const { id } = useParams()
  const destination = destinations.find((d) => d.id === id)
  const { favoriteDestinations, toggleFavoriteDestination } = useApp()
  const [activeImage, setActiveImage] = useState(0)

  if (!destination) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="Destination not found" description="This destination may have been removed." action={<Link to="/destinations"><Button>Back to destinations</Button></Link>} />
      </div>
    )
  }

  const nearbyHomestays = homestays.filter((h) => h.destinationId === destination.id)
  const destinationReviews = allReviews.filter((r) => r.targetType === 'destination' && r.targetId === destination.id)
  const isFavorite = favoriteDestinations.includes(destination.id)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Image gallery */}
      <div className="overflow-hidden rounded-2xl">
        <img src={destination.gallery[activeImage]} alt={destination.name} className="h-72 w-full object-cover sm:h-96" />
      </div>
      {destination.gallery.length > 1 && (
        <div className="mt-3 flex gap-3">
          {destination.gallery.map((img, i) => (
            <button
              key={img}
              onClick={() => setActiveImage(i)}
              className={`h-16 w-24 overflow-hidden rounded-lg border-2 ${activeImage === i ? 'border-teal-500' : 'border-transparent'}`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="mt-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-medium text-ink-900">{destination.name}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
            <FaMapMarkerAlt size={12} /> {destination.region}
          </p>
          <div className="mt-2">
            <StarRating rating={destination.rating} reviewCount={destination.reviewCount} />
          </div>
        </div>
        <button
          onClick={() => toggleFavoriteDestination(destination.id)}
          className="flex items-center gap-2 rounded-xl border border-ink-900/10 px-4 py-2.5 text-sm font-medium text-terracotta-500 hover:bg-sand-100"
        >
          {isFavorite ? <FaHeart /> : <FaRegHeart />} {isFavorite ? 'Saved' : 'Save'}
        </button>
      </div>

      {/* Quick facts */}
      <div className="mt-6 flex flex-wrap gap-4 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-ink-700">
          <FaWallet className="text-teal-700" /> Est. budget: <span className="font-medium">${destination.estimatedBudget}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-ink-700">
          <FaCalendarAlt className="text-teal-700" /> Best time: <span className="font-medium">{destination.bestSeason}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {destination.travelType.map((t) => (
            <span key={t} className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="mt-8">
        <h2 className="font-display text-xl font-medium text-ink-900">About {destination.name}</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-700">{destination.description}</p>
      </div>

      {/* Things to do */}
      <div className="mt-8">
        <h2 className="font-display text-xl font-medium text-ink-900">Things to do</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {destination.thingsToDo.map((thing) => (
            <div key={thing} className="flex items-center gap-2 rounded-xl bg-white p-3 text-sm text-ink-700 shadow-sm">
              <FaCheckCircle className="shrink-0 text-forest-500" size={14} />
              {thing}
            </div>
          ))}
        </div>
      </div>

      {/* Map placeholder */}
      <div className="mt-8">
        <h2 className="font-display text-xl font-medium text-ink-900">Location</h2>
        <div className="mt-3 flex h-56 items-center justify-center rounded-2xl bg-sand-200 text-sm text-ink-500">
          <FaMapMarkerAlt className="mr-2" /> Map placeholder — {destination.region}
        </div>
      </div>

      {/* Nearby homestays */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-medium text-ink-900">Nearby homestays</h2>
        {nearbyHomestays.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">No homestays listed near this destination yet.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {nearbyHomestays.map((h) => (
              <HomestayCard key={h.id} homestay={h} />
            ))}
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-medium text-ink-900">Traveler reviews</h2>
        {destinationReviews.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">No reviews yet for this destination.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {destinationReviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}
      </div>

      {/* Book CTA */}
      <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl bg-teal-900 p-8 text-center">
        <h3 className="font-display text-xl font-medium text-white">Ready to visit {destination.name}?</h3>
        <Link to="/homestays">
          <Button>Book a nearby homestay</Button>
        </Link>
      </div>
    </div>
  )
}
