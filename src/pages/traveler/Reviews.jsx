import { useState } from 'react'
import { FaStar, FaRegStar } from 'react-icons/fa'
import ReviewCard from '../../components/cards/ReviewCard'
import Button from '../../components/shared/Button'
import EmptyState from '../../components/shared/EmptyState'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'

export default function Reviews() {
  const { user } = useAuth()
  const { reviews, addReview, homestays, bookings } = useApp()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [targetId, setTargetId] = useState('')

  const myCompletedHomestays = bookings
    .filter((b) => b.travelerId === user.id && b.status === 'completed')
    .map((b) => homestays.find((h) => h.id === b.homestayId))
    .filter(Boolean)

  const myReviews = reviews.filter((r) => r.travelerId === user.id)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!targetId || !comment.trim()) return
    addReview({
      targetType: 'homestay',
      targetId,
      travelerId: user.id,
      travelerName: user.fullName,
      avatar: user.avatar,
      rating,
      comment: comment.trim(),
    })
    setComment('')
    setRating(5)
    setTargetId('')
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-ink-900">Reviews</h1>
      <p className="mt-1 text-sm text-ink-500">Share your experience and view your past reviews.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm lg:col-span-1">
          <h2 className="font-display text-base font-medium text-ink-900">Write a review</h2>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Homestay</label>
            <select
              required
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full rounded-xl border border-ink-900/10 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
            >
              <option value="">Select a completed stay</option>
              {myCompletedHomestays.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
            {myCompletedHomestays.length === 0 && (
              <p className="mt-1 text-xs text-ink-500">Complete a booking to leave a review.</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Rating</label>
            <div className="flex gap-1 text-terracotta-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <button type="button" key={star} onClick={() => setRating(star)} aria-label={`${star} stars`}>
                  {star <= rating ? <FaStar size={20} /> : <FaRegStar size={20} />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Comment</label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like about your stay?"
              className="w-full rounded-xl border border-ink-900/10 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
            />
          </div>

          <Button type="submit" disabled={myCompletedHomestays.length === 0}>
            Submit review
          </Button>
        </form>

        <div className="lg:col-span-2">
          <h2 className="font-display text-base font-medium text-ink-900">Your reviews</h2>
          <div className="mt-3 flex flex-col gap-3">
            {myReviews.length === 0 ? (
              <EmptyState title="No reviews yet" description="Your submitted reviews will appear here." />
            ) : (
              myReviews.map((r) => <ReviewCard key={r.id} review={r} />)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
