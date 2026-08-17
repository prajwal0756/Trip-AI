import StarRating from '../shared/StarRating'
import {
  FaCheckCircle,
  FaMinusCircle,
  FaTimesCircle,
} from 'react-icons/fa'
import defaultAvatar from '../../assets/default-avatar.png'
export default function ReviewCard({ review }) {
  const sentiment = review.sentiment

  const getSentimentStyle = (label) => {
    switch (label) {
      case 'positive':
        return {
          icon: FaCheckCircle,
          text: 'Positive',
          className:
            'bg-green-50 text-green-700 border-green-200',
        }

      case 'negative':
        return {
          icon: FaTimesCircle,
          text: 'Negative',
          className:
            'bg-red-50 text-red-700 border-red-200',
        }

      case 'neutral':
        return {
          icon: FaMinusCircle,
          text: 'Neutral',
          className:
            'bg-slate-50 text-slate-600 border-slate-200',
        }

      case 'mixed':
        return {
          icon: FaMinusCircle,
          text: 'Mixed',
          className:
            'bg-amber-50 text-amber-700 border-amber-200',
        }

      default:
        return null
    }
  }

  const sentimentStyle = getSentimentStyle(
    sentiment?.label
  )

  const SentimentIcon =
    sentimentStyle?.icon

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">

        {/* Avatar */}
        <img
          
          src={review.avatar || defaultAvatar}
          alt={review.travelerName}
          className="h-10 w-10 rounded-full object-cover"
          
        />

        <div className="flex-1">

          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-ink-900">
              {review.travelerName}
            </p>

            <p className="text-xs text-ink-500">
              {review.date}
            </p>
          </div>

          {/* Rating */}
          <div className="mt-1">
            <StarRating
              rating={review.rating}
              size={12}
            />
          </div>

          {/* Review */}
          <p className="mt-2 text-sm text-ink-700">
            {review.comment}
          </p>

          {/* AI Sentiment */}
          {sentimentStyle && (
            <div className="mt-3 flex flex-wrap items-center gap-2">

              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${sentimentStyle.className}`}
              >
                <SentimentIcon size={11} />

                AI Sentiment:
                {' '}
                {sentimentStyle.text}
              </span>

              {typeof sentiment.confidence ===
                'number' && (
                <span className="text-xs text-ink-500">
                  {(
                    sentiment.confidence * 100
                  ).toFixed(1)}
                  % confidence
                </span>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  )
}