import { Link } from 'react-router-dom'
import { FaHeart, FaRegHeart, FaMapMarkerAlt } from 'react-icons/fa'
import StarRating from '../shared/StarRating'
import { useApp } from '../../context/AppContext'

export default function DestinationCard({ destination }) {
  const { favoriteDestinations, toggleFavoriteDestination } = useApp()
  const isFavorite = favoriteDestinations.includes(destination.id)

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-[#FFFCF7] dark:bg-[#121C27] border border-navy-900/10 dark:border-white/10 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-navy-900/20 dark:hover:border-white/20">
      {/* Reduced Image Height (16:10 aspect ratio) */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-navy-950/10 dark:bg-navy-950/40">
        <img
          src={destination.image}
          alt={destination.name}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80'
          }}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
        />
        {/* Subtle Dark Gradient behind Location Text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

        {/* Location Overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-medium text-white drop-shadow-sm">
          <FaMapMarkerAlt size={11} className="text-terracotta-400" />
          <span>{destination.region}</span>
        </div>

        {/* Floating Heart Button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            toggleFavoriteDestination(destination.id)
          }}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-[#0B1117]/80 text-terracotta-500 backdrop-blur-md border border-white/40 dark:border-white/20 shadow-sm transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          {isFavorite ? <FaHeart size={14} /> : <FaRegHeart size={14} className="text-navy-900/60 dark:text-white/70" />}
        </button>
      </div>

      {/* Clean Solid Card Interior */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-display text-lg font-semibold text-[#10263A] dark:text-[#F5F3EE] group-hover:text-terracotta-500 transition-colors duration-200">
              {destination.name}
            </h3>
            {/* Toned Down Price Badge */}
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-sand-200/60 dark:bg-white/10 text-ink-700/80 dark:text-[#AAB5C0] tracking-tight shrink-0">
              ${destination.estimatedBudget} est.
            </span>
          </div>

          <div className="mt-2">
            <StarRating rating={destination.rating} reviewCount={destination.reviewCount} />
          </div>

          <p className="mt-2.5 line-clamp-2 text-sm text-ink-500 dark:text-[#AAB5C0] leading-relaxed">
            {destination.description}
          </p>
        </div>

        <Link
          to={`/destination/${destination.id}`}
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-[#10263A]/15 dark:border-white/15 bg-transparent px-4 py-2 text-sm font-medium text-[#10263A] dark:text-[#F5F3EE] transition-colors duration-150 hover:bg-[#10263A] hover:text-white dark:hover:bg-white dark:hover:text-[#10263A]"
        >
          View details →
        </Link>
      </div>
    </div>
  )
}
