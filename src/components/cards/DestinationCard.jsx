import { Link } from 'react-router-dom'
import {
  FaHeart,
  FaRegHeart,
  FaMapMarkerAlt,
  FaMountain,
} from 'react-icons/fa'
import StarRating from '../shared/StarRating'
import { useApp } from '../../context/AppContext'

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80'

export default function DestinationCard({ destination }) {
  const {
    favoriteDestinations,
    toggleFavoriteDestination,
  } = useApp()

  const destinationId = String(
    destination?.id ??
    destination?.destination_id ??
    ''
  )

  const isFavorite =
    favoriteDestinations.includes(destinationId)

  const image =
    destination?.image ||
    destination?.image_url ||
    null

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-[#FFFCF7] dark:bg-[#121C27] border border-navy-900/10 dark:border-white/10 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-navy-900/20 dark:hover:border-white/20">

      {/* IMAGE */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#102D3B]">

        {image ? (
          <img
            src={image}
            alt={destination?.name || 'Destination'}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = PLACEHOLDER_IMAGE
            }}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#102D3B] via-[#123E43] to-[#0B1C28]">
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/10">
                <FaMountain
                  size={28}
                  className="text-white/60"
                />
              </div>

              <p className="text-sm font-medium text-white/70">
                Destination image
              </p>

              <p className="mt-1 text-xs text-white/40">
                Coming soon
              </p>
            </div>
          </div>
        )}

        {/* GRADIENT */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />

        {/* LOCATION */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-medium text-white drop-shadow-sm">
          <FaMapMarkerAlt
            size={11}
            className="text-terracotta-400"
          />

          <span>
            {destination?.region || 'Nepal'}
          </span>
        </div>

        {/* FAVORITE */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()

            toggleFavoriteDestination(
              destinationId
            )
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

      {/* CONTENT */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">

        <div>

          <div className="flex items-baseline justify-between gap-2">

            <h3 className="font-display text-lg font-semibold text-[#10263A] dark:text-[#F5F3EE] group-hover:text-terracotta-500 transition-colors duration-200">
              {destination?.name || 'Destination'}
            </h3>

            <span className="shrink-0 rounded bg-sand-200/60 px-2 py-0.5 text-[11px] font-medium tracking-tight text-ink-700/80 dark:bg-white/10 dark:text-[#AAB5C0]">
              NPR{' '}
              {Number(
                destination?.estimatedBudget || 0
              ).toLocaleString()}
            </span>

          </div>

          <div className="mt-2">
            <StarRating
              rating={Number(
                destination?.rating || 0
              )}
              reviewCount={Number(
                destination?.reviewCount || 0
              )}
            />
          </div>

          <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-ink-500 dark:text-[#AAB5C0]">
            {destination?.description ||
              'Discover this beautiful destination in Nepal.'}
          </p>

        </div>

        {/* DETAILS BUTTON */}
        <Link
          to={`/destination/${destinationId}`}
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-[#10263A]/15 dark:border-white/15 bg-transparent px-4 py-2 text-sm font-medium text-[#10263A] dark:text-[#F5F3EE] transition-colors duration-150 hover:bg-[#10263A] hover:text-white dark:hover:bg-white dark:hover:text-[#10263A]"
        >
          View details →
        </Link>

      </div>
    </div>
  )
}