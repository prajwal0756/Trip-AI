import { Link } from 'react-router-dom'
import { FaHeart, FaRegHeart, FaMapMarkerAlt } from 'react-icons/fa'
import StarRating from '../shared/StarRating'
import Badge from '../shared/Badge'
import { useApp } from '../../context/AppContext'

export default function HomestayCard({ homestay, showBookButton = true, onBook }) {
  const { favoriteHomestays, toggleFavoriteHomestay } = useApp()
  const isFavorite = favoriteHomestays.includes(homestay.id)

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-[#FFFCF7] dark:bg-[#121C27] border border-navy-900/10 dark:border-white/10 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-navy-900/20 dark:hover:border-white/20">
      {/* Aspect Ratio 16:10 Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-navy-950/10 dark:bg-navy-950/40">
        <img
          src={homestay.image}
          alt={homestay.name}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80'
          }}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
        />
        {/* Subtle Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

        {/* Availability Badge */}
        <div className="absolute left-3 top-3">
          <Badge status={homestay.availability}>{homestay.availability}</Badge>
        </div>

        {/* Floating Heart Button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            toggleFavoriteHomestay(homestay.id)
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
          <h3 className="font-display text-lg font-semibold text-[#10263A] dark:text-[#F5F3EE] group-hover:text-terracotta-500 transition-colors duration-200">
            {homestay.name}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500 dark:text-[#AAB5C0]">
            <FaMapMarkerAlt size={12} className="text-terracotta-500 shrink-0" /> {homestay.location}
          </p>
          <p className="mt-1 text-xs text-ink-500/80 dark:text-[#AAB5C0]/80">Hosted by {homestay.ownerName}</p>

          <div className="mt-2">
            <StarRating rating={homestay.rating} reviewCount={homestay.reviewCount} />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {homestay.amenities.slice(0, 3).map((a) => (
              <span key={a} className="rounded-md bg-sand-200/70 dark:bg-white/10 px-2.5 py-1 text-xs font-medium text-[#10263A] dark:text-[#AAB5C0]">
                {a}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#10263A]/10 dark:border-white/10">
          <div>
            <span className="text-lg font-bold text-[#10263A] dark:text-[#F5F3EE]">${homestay.price}</span>
            <span className="text-xs text-ink-500 dark:text-[#AAB5C0]"> / night</span>
          </div>
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
                to={`/homestays?book=${homestay.id}`}
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
