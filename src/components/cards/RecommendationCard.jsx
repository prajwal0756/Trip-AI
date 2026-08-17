import { Link } from 'react-router-dom'
import {
  FaMapMarkerAlt,
  FaWallet,
  FaCalendarAlt,
  FaStar,
  FaArrowRight,
  FaMagic,
} from 'react-icons/fa'

export default function RecommendationCard({ recommendation }) {
  const {
    destination_id,
    destination_name,
    province,
    district,
    best_season,
    estimated_budget_npr,
    average_rating,
    description,
    similarity_score,
  } = recommendation

  const rating = Number(average_rating || 0)
  const similarity = Number(similarity_score || 0)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111B28] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/40 hover:shadow-xl">

      {/* Destination visual header */}
      <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-[#183344] via-[#102432] to-[#0B1117]">

        {/* Decorative background */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-teal-500/20 blur-2xl" />
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-terracotta-500/20 blur-2xl" />
        </div>

        <div className="relative px-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-terracotta-400">
            <FaMapMarkerAlt size={18} />
          </div>

          <h3 className="font-display text-xl font-semibold text-white">
            {destination_name}
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            {district}, {province}
          </p>
        </div>
      </div>

      {/* Card content */}
      <div className="flex flex-1 flex-col p-5">

        {/* Name + rating */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-white">
              {destination_name}
            </h3>

            <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
              <FaMapMarkerAlt size={11} className="text-terracotta-400" />
              <span>
                {district}, {province}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-white">
            <FaStar className="text-terracotta-400" size={13} />
            {rating.toFixed(1)}
          </div>
        </div>

        {/* Basic information */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-slate-300">
            <FaWallet size={10} className="text-teal-400" />
            NPR {Number(estimated_budget_npr || 0).toLocaleString()}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-slate-300">
            <FaCalendarAlt size={10} className="text-teal-400" />
            {best_season || 'Year-round'}
          </span>
        </div>

        {/* Description */}
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">
          {description || 'A destination selected based on your travel preferences.'}
        </p>

        {/* AI match */}
        <div className="mt-4 flex items-center gap-2 text-xs text-teal-300">
          <FaMagic size={11} />
          <span>
            {similarity > 0
              ? `${(similarity * 100).toFixed(1)}% preference match`
              : 'Recommended for your preferences'}
          </span>
        </div>

        {/* Action */}
        <Link
          to={`/destination/${destination_id}`}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-terracotta-500 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-terracotta-600 group-hover:shadow-md"
        >
          Explore destination
          <FaArrowRight
            size={11}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </article>
  )
}