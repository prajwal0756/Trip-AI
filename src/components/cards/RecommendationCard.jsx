import { Link } from 'react-router-dom'
import { FaLightbulb, FaCalendarAlt, FaWallet } from 'react-icons/fa'
import StarRating from '../shared/StarRating'

export default function RecommendationCard({ recommendation }) {
  const {
    destination_id,
    destination_name,
    province,
    district,
    best_season,
    estimated_budget_npr,
    average_rating,
    review_count,
    description,
    similarity_score,
    final_score,
  } = recommendation

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

      <div className="flex h-44 items-center justify-center bg-sand-100">
        <div className="text-center px-6">
          <p className="font-display text-xl font-medium text-ink-900">
            {destination_name}
          </p>
          <p className="mt-1 text-sm text-ink-500">
            {district}, {province}
          </p>
        </div>
      </div>

      <div className="p-5">

        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-medium text-ink-900">
            {destination_name}
          </h3>

          <StarRating
            rating={Number(average_rating || 0)}
            size={12}
          />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-500">

          <span className="flex items-center gap-1">
            <FaWallet size={11} />
            NPR {Number(estimated_budget_npr || 0).toLocaleString()}
          </span>

          <span className="flex items-center gap-1">
            <FaCalendarAlt size={11} />
            {best_season || 'Year-round'}
          </span>

        </div>

        <p className="mt-3 text-sm text-ink-500">
          {description}
        </p>

        <div className="mt-4 rounded-xl bg-teal-50 p-3">

          <div className="flex items-center gap-2">
            <FaLightbulb
              className="text-teal-600"
              size={14}
            />

            <p className="text-xs font-medium text-teal-700">
              AI Recommendation
            </p>
          </div>

          <p className="mt-1 text-xs text-teal-700">
            Similarity: {(Number(similarity_score) * 100).toFixed(1)}%
            {' · '}
            Final score: {(Number(final_score) * 100).toFixed(1)}%
          </p>

        </div>

        <Link
          to={`/destination/${destination_id}`}
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-terracotta-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-terracotta-600"
        >
          Explore {destination_name}
        </Link>

      </div>
    </div>
  )
}