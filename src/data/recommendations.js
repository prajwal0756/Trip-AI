// Rule-based recommendation engine for TripAI.
//
// This mimics the *interface* of an ML recommendation model (a scoring function
// over a feature set) without a trained model behind it, since this is a
// frontend-only mock. Replace `scoreDestination` with a real API call to a
// backend recommender (e.g. NLP intent extraction + sentiment-ranked homestays)
// when one exists — the calling code in RecommendationForm only depends on
// `getRecommendations(preferences)` returning the same shape.

import { destinations } from './destinations'
import { homestays } from './homestays'

const ACTIVITY_KEYWORDS = {
  hiking: ['hike', 'trek', 'viewpoint', 'sunrise'],
  food: ['cuisine', 'tea', 'meal', 'food'],
  culture: ['temple', 'square', 'museum', 'heritage', 'architecture'],
  wildlife: ['safari', 'rhino', 'tiger', 'jungle', 'elephant'],
  relaxation: ['quiet', 'calm', 'meditation', 'garden'],
}

function activityScore(destination, preferredActivities = []) {
  if (!preferredActivities.length) return 0
  const text = (destination.thingsToDo.join(' ') + ' ' + destination.description).toLowerCase()
  let score = 0
  preferredActivities.forEach((activity) => {
    const keywords = ACTIVITY_KEYWORDS[activity] || [activity.toLowerCase()]
    if (keywords.some((kw) => text.includes(kw))) score += 1
  })
  return score / preferredActivities.length
}

function budgetScore(destination, budget) {
  if (!budget) return 0.5
  const diff = Math.abs(destination.estimatedBudget - Number(budget))
  if (diff <= 30) return 1
  if (diff <= 80) return 0.7
  if (diff <= 150) return 0.4
  return 0.1
}

function travelTypeScore(destination, travelType) {
  if (!travelType) return 0.5
  return destination.travelType.includes(travelType) ? 1 : 0
}

function regionScore(destination, region) {
  if (!region || region === 'Any') return 0.5
  return destination.region === region ? 1 : 0.3
}

/**
 * Scores a destination against user preferences (0-1 scale per factor,
 * weighted sum). Weights reflect which factors matter most for matching
 * intent — travel type and activities are weighted highest since they
 * carry the most "preference signal".
 */
function scoreDestination(destination, preferences) {
  const wTravelType = 0.3
  const wActivities = 0.3
  const wBudget = 0.2
  const wRegion = 0.1
  const wRating = 0.1

  const tScore = travelTypeScore(destination, preferences.travelType)
  const aScore = activityScore(destination, preferences.activities)
  const bScore = budgetScore(destination, preferences.budget)
  const rScore = regionScore(destination, preferences.region)
  const ratingScore = destination.rating / 5

  const total =
    tScore * wTravelType + aScore * wActivities + bScore * wBudget + rScore * wRegion + ratingScore * wRating

  return { total, tScore, aScore, bScore, rScore }
}

function buildReason(destination, preferences, breakdown) {
  const reasons = []
  if (breakdown.tScore === 1) reasons.push(`matches your interest in ${preferences.travelType.toLowerCase()} travel`)
  if (breakdown.aScore > 0.5) reasons.push('aligns with your preferred activities')
  if (breakdown.bScore >= 0.7) reasons.push('fits comfortably within your budget')
  if (breakdown.rScore === 1) reasons.push(`located in your preferred region (${preferences.region})`)
  if (destination.rating >= 4.6) reasons.push('consistently highly rated by past travelers')

  if (reasons.length === 0) return 'A well-rounded option based on overall popularity and rating.'
  return 'Recommended because it ' + reasons.join(', ') + '.'
}

/**
 * Returns the top homestays for a given destination, ranked by rating.
 * In a real system this is where sentiment-analyzed review scores would
 * factor into the ranking, not just the raw star rating.
 */
function suggestedHomestaysFor(destinationId, limit = 2) {
  return homestays
    .filter((h) => h.destinationId === destinationId)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit)
}

/**
 * Main entry point: given user preferences from the AI Recommendation form,
 * returns a ranked list of destination recommendations with reasoning and
 * suggested homestays attached.
 */
export function getRecommendations(preferences, limit = 6) {
  const scored = destinations.map((destination) => {
    const breakdown = scoreDestination(destination, preferences)
    return {
      destination,
      score: breakdown.total,
      reason: buildReason(destination, preferences, breakdown),
      suggestedHomestays: suggestedHomestaysFor(destination.id),
    }
  })

  return scored.sort((a, b) => b.score - a.score).slice(0, limit)
}
