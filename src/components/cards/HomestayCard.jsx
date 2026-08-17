import { Link } from 'react-router-dom'
import {
  FaHeart,
  FaRegHeart,
  FaMapMarkerAlt,
  FaUsers,
} from 'react-icons/fa'

import StarRating from '../shared/StarRating'
import Badge from '../shared/Badge'
import { useApp } from '../../context/AppContext'


export default function HomestayCard({
  homestay,
  showBookButton = true,
  onBook,
}) {
  const {
    favoriteHomestays,
    toggleFavoriteHomestay,
  } = useApp()


  // =====================================================
  // SUPPORT BOTH OLD FRONTEND DATA + BACKEND DATA
  // =====================================================

  const id =
    homestay.homestay_id ??
    homestay.id

  const name =
    homestay.homestay_name ??
    homestay.name ??
    'Homestay'

  const district =
    homestay.district ??
    ''

  const province =
    homestay.province ??
    ''

  const location =
    homestay.location ??
    (
      district
        ? `${district}${province ? `, ${province}` : ''}`
        : 'Nepal'
    )

  const rating = Number(
    homestay.rating ??
    homestay.average_rating ??
    0
  )

  const reviewCount = Number(
    homestay.review_count ??
    homestay.reviewCount ??
    0
  )

  const price = Number(
    homestay.price_per_night_npr ??
    homestay.price ??
    0
  )

  const maxGuests = Number(
    homestay.max_guests ??
    homestay.capacity ??
    0
  )

  const roomCount =
    homestay.room_count ??
    null

  const availability =
    homestay.availability ??
    (
      homestay.meals_available === 'Yes'
        ? 'Available'
        : 'Available'
    )

  const image =
    homestay.image ??
    homestay.image_url ??
    null

  const description =
    homestay.description ??
    ''

  const homestayType =
    homestay.homestay_type ??
    homestay.homestayType ??
    ''


  // =====================================================
  // AMENITIES
  // =====================================================

  let amenities = []

  if (Array.isArray(homestay.amenities)) {
    amenities = homestay.amenities
  } else if (
    typeof homestay.amenities === 'string'
  ) {
    amenities = homestay.amenities
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }


  // =====================================================
  // FAVORITE
  // =====================================================

  const isFavorite =
    favoriteHomestays.includes(id) ||
    favoriteHomestays.includes(String(id))


  // =====================================================
  // FALLBACK IMAGE
  // =====================================================

  const fallbackImage =
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80'


  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-[#FFFCF7] dark:bg-[#121C27] border border-navy-900/10 dark:border-white/10 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-navy-900/20 dark:hover:border-white/20">


      {/* =================================================
          IMAGE
      ================================================= */}

      <div className="relative aspect-[16/10] w-full overflow-hidden bg-navy-950/10 dark:bg-navy-950/40">

        {image ? (

          <img
            src={image}
            alt={name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = fallbackImage
            }}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
          />

        ) : (

          <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#12635E] via-[#0D4E4A] to-[#072F2D]">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,123,72,0.15),transparent_65%)]" />

            <div className="relative z-10 text-center">

              <FaMapMarkerAlt
                size={28}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 font-display text-xl font-semibold text-white">
                {name}
              </p>

              <p className="mt-1 text-sm text-slate-300">
                {district || 'Nepal'}
              </p>

            </div>

          </div>

        )}


        {/* Gradient */}

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />


        {/* Availability */}

        <div className="absolute left-3 top-3">

          <Badge status={availability}>
            {availability}
          </Badge>

        </div>


        {/* Favorite */}

        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()

            toggleFavoriteHomestay(id)
          }}
          aria-label={
            isFavorite
              ? 'Remove from favorites'
              : 'Add to favorites'
          }
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-[#0B1117]/80 text-terracotta-500 backdrop-blur-md border border-white/40 dark:border-white/20 shadow-sm transition-transform duration-200 hover:scale-105 active:scale-95"
        >

          {isFavorite ? (
            <FaHeart size={14} />
          ) : (
            <FaRegHeart
              size={14}
              className="text-navy-900/60 dark:text-white/70"
            />
          )}

        </button>

      </div>


      {/* =================================================
          CARD CONTENT
      ================================================= */}

      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">

        <div>

          {/* NAME */}

          <h3 className="font-display text-lg font-semibold text-[#10263A] dark:text-[#F5F3EE] group-hover:text-terracotta-500 transition-colors duration-200">

            {name}

          </h3>


          {/* LOCATION */}

          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500 dark:text-[#AAB5C0]">

            <FaMapMarkerAlt
              size={12}
              className="text-terracotta-500 shrink-0"
            />

            {location}

          </p>


          {/* HOMESTAY TYPE */}

          {homestayType && (

            <p className="mt-1 text-xs text-ink-500/80 dark:text-[#AAB5C0]/80">

              {homestayType}

            </p>

          )}


          {/* RATING */}

          <div className="mt-2">

            <StarRating
              rating={rating}
              reviewCount={reviewCount}
            />

          </div>


          {/* GUEST CAPACITY */}

          {maxGuests > 0 && (

            <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-500 dark:text-[#AAB5C0]">

              <FaUsers size={11} />

              Up to {maxGuests} guest
              {maxGuests !== 1 ? 's' : ''}

              {roomCount && (
                <>
                  <span>•</span>
                  {roomCount} room
                  {roomCount !== 1 ? 's' : ''}
                </>
              )}

            </div>

          )}


          {/* AMENITIES */}

          {amenities.length > 0 && (

            <div className="mt-3 flex flex-wrap gap-1.5">

              {amenities
                .slice(0, 3)
                .map((amenity) => (

                  <span
                    key={amenity}
                    className="rounded-md bg-sand-200/70 dark:bg-white/10 px-2.5 py-1 text-xs font-medium text-[#10263A] dark:text-[#AAB5C0]"
                  >
                    {amenity}
                  </span>

                ))}

            </div>

          )}


          {/* DESCRIPTION */}

          {description && (

            <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-ink-500 dark:text-[#AAB5C0]">

              {description}

            </p>

          )}

        </div>


        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#10263A]/10 dark:border-white/10">


          {/* PRICE */}

          <div>

            <span className="text-lg font-bold text-[#10263A] dark:text-[#F5F3EE]">

              NPR {price.toLocaleString()}

            </span>

            <span className="text-xs text-ink-500 dark:text-[#AAB5C0]">

              {' '} / night

            </span>

          </div>


          {/* BOOK BUTTON */}

          {showBookButton && (

            onBook ? (

              <button
                onClick={onBook}
                className="rounded-xl bg-terracotta-500 hover:bg-terracotta-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-150"
              >
                Book now
              </button>

            ) : (

              <Link
                to={`/homestays?book=${id}`}
                className="rounded-xl bg-terracotta-500 hover:bg-terracotta-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-150"
              >
                Book now
              </Link>

            )

          )}

        </div>

      </div>

    </div>
  )
}
