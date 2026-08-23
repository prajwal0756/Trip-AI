import { Link } from 'react-router-dom'

import {
  FaMapMarkerAlt,
  FaWallet,
  FaCalendarAlt,
  FaStar,
  FaArrowRight,
  FaMagic,
} from 'react-icons/fa'

export default function RecommendationCard({
  recommendation,
}) {
  const {
    destination_id,
    destination_name,
    province,
    district,
    best_season,
    estimated_budget_npr,
    average_duration_days,
    average_rating,
    description,
    similarity_score,
    image_url,
  } = recommendation

  const rating = Number(average_rating || 0)
  const similarity = Number(similarity_score || 0)

  const imageSrc = image_url
    ? image_url.startsWith('http')
      ? image_url
      : `http://127.0.0.1:8000${image_url}`
    : null

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5E1D8] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

      {/* =====================================================
          IMAGE
      ===================================================== */}

      <div className="relative h-48 overflow-hidden bg-[#173542]">

        {imageSrc ? (
          <img
            src={imageSrc}
            alt={destination_name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#173D4A] to-[#10242F]">
            <FaMapMarkerAlt
              size={32}
              className="text-terracotta-400"
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/5" />

        {/* Rating */}

        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#253330] shadow-sm">
          <FaStar
            size={11}
            className="text-amber-500"
          />
          {rating.toFixed(1)}
        </div>

        {/* Location */}

        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs font-medium text-white">
          <FaMapMarkerAlt
            size={11}
            className="text-terracotta-300"
          />

          {district}, {province}
        </div>

      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="flex flex-1 flex-col p-5">

        <h3 className="font-display text-xl font-semibold leading-tight text-[#172725]">
          {destination_name}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6B7672]">
          {description ||
            'A destination selected based on your travel preferences.'}
        </p>

        {/* =================================================
            INFO
        ================================================= */}

        <div className="mt-4 flex flex-wrap gap-2">

          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#F4F0E8] px-3 py-1.5 text-xs font-medium text-[#56615E]">
            <FaWallet
              size={10}
              className="text-teal-700"
            />

            NPR{' '}
            {Number(
              estimated_budget_npr || 0
            ).toLocaleString()}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#F4F0E8] px-3 py-1.5 text-xs font-medium text-[#56615E]">
            <FaCalendarAlt
              size={10}
              className="text-teal-700"
            />

            {average_duration_days || 1}{' '}
            {Number(average_duration_days) === 1
              ? 'day'
              : 'days'}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#F4F0E8] px-3 py-1.5 text-xs font-medium text-[#56615E]">
            <FaCalendarAlt
              size={10}
              className="text-teal-700"
            />

            {best_season || 'Year-round'}
          </span>

        </div>

        {/* =================================================
            MATCH
        ================================================= */}

        <div className="mt-4 flex items-center gap-2">

          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <FaMagic size={11} />
          </span>

          <span className="text-xs font-medium text-teal-700">
            {similarity > 0
              ? `${(
                  similarity * 100
                ).toFixed(1)}% preference match`
              : 'Recommended for you'}
          </span>

        </div>

        {/* =================================================
            ACTION
        ================================================= */}

        <Link
          to={`/destination/${destination_id}`}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-terracotta-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-terracotta-600"
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