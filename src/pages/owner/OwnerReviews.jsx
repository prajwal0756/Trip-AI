import { FaStar } from 'react-icons/fa'
import ReviewCard from '../../components/cards/ReviewCard'
import EmptyState from '../../components/shared/EmptyState'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'

export default function OwnerReviews() {
  const { user } = useAuth()
  const { homestays, reviews } = useApp()

  const myHomestays = homestays.filter((h) => h.ownerId === user.id)
  const myHomestayIds = myHomestays.map((h) => h.id)
  const myReviews = reviews.filter((r) => r.targetType === 'homestay' && myHomestayIds.includes(r.targetId))

  const avgRating = myReviews.length
    ? (myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length).toFixed(1)
    : '—'

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-ink-900">Customer reviews</h1>
      <p className="mt-1 text-sm text-ink-500">Feedback from travelers who stayed at your homestays.</p>

      <div className="mt-6 flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-terracotta-500/10 text-terracotta-500">
          <FaStar size={20} />
        </div>
        <div>
          <p className="font-display text-2xl font-medium text-ink-900">{avgRating}</p>
          <p className="text-xs text-ink-500">Average rating across {myReviews.length} review{myReviews.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {myReviews.length === 0 ? (
          <EmptyState title="No reviews yet" description="Reviews from travelers will show up here once they complete a stay." />
        ) : (
          myReviews.map((r) => {
            const h = myHomestays.find((x) => x.id === r.targetId)
            return (
              <div key={r.id}>
                <p className="mb-1.5 text-xs font-medium text-ink-500">{h?.name}</p>
                <ReviewCard review={r} />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
