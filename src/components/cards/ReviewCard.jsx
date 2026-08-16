import StarRating from '../shared/StarRating'

export default function ReviewCard({ review }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <img src={review.avatar} alt={review.travelerName} className="h-10 w-10 rounded-full object-cover" />
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-ink-900">{review.travelerName}</p>
            <p className="text-xs text-ink-500">{review.date}</p>
          </div>
          <div className="mt-1">
            <StarRating rating={review.rating} size={12} />
          </div>
          <p className="mt-2 text-sm text-ink-700">{review.comment}</p>
        </div>
      </div>
    </div>
  )
}
