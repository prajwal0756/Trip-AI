import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'

export default function StarRating({ rating, reviewCount, size = 14 }) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.5
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0)

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5 text-terracotta-500">
        {Array.from({ length: fullStars }).map((_, i) => (
          <FaStar key={`f${i}`} size={size} />
        ))}
        {hasHalf && <FaStarHalfAlt size={size} />}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <FaRegStar key={`e${i}`} size={size} />
        ))}
      </div>
      <span className="text-sm font-medium text-ink-900">{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-sm text-ink-500">({reviewCount})</span>
      )}
    </div>
  )
}
