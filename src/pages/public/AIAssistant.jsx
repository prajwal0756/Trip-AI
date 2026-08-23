import { useEffect, useState } from 'react'
import {
  FaMagic,
  FaPaperPlane,
  FaMapMarkerAlt,
  FaStar,
  FaWallet,
  FaCalendarAlt,
  FaRoute,
  FaCheckCircle,
} from 'react-icons/fa'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../../api/client'

export default function AIAssistant() {
  const [query, setQuery] = useState('')
  const [searchParams] = useSearchParams()
  useEffect(() => {
    const initialQuery = searchParams.get('q')

    if (initialQuery) {
      setQuery(initialQuery)
      handleSubmit({ preventDefault: () => {} }, initialQuery)
    }
  }, [])

  const handlePromptKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      e.currentTarget.form?.requestSubmit()
    }
  }
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [aiResponse, setAiResponse] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e, queryOverride = null) => {
    e.preventDefault()

    const trimmedQuery = (queryOverride ?? query).trim()

    if (!trimmedQuery || loading) return

    try {
      setLoading(true)
      setError('')
      setResults([])
      setAiResponse(null)

      const response = await api.post('/ai/query', {
        query: trimmedQuery,
      })

      const data = response.data || {}

      setAiResponse(data)

      const recommendations = Array.isArray(data.results)
        ? data.results
        : []

      setResults(recommendations)
    } catch (err) {
      console.error('AI recommendation error:', err)

      setError(
        err.response?.data?.detail ||
          'Unable to find destinations right now. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleExample = (example) => {
    setQuery(example)
  }

  return (
    <div className="min-h-screen bg-sand-50 text-ink-900">

      {/* =========================================
          HEADER
      ========================================= */}

      {/* <header className="border-b border-white/10 bg-[#0B1117]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">

          <Link
            to="/"
            className="font-display text-2xl font-bold"
          >
            Trip<span className="text-terracotta-400">AI</span>
          </Link>

          <Link
            to="/destinations"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            Explore destinations
          </Link>

        </div>
      </header> */}


      {/* =========================================
          MAIN
      ========================================= */}

      <main className="mx-auto max-w-6xl px-5 py-10 lg:px-8">

        {/* =========================================
    PAGE INTRO
========================================= */}

        {results.length === 0 && (
          <section className="mx-auto max-w-3xl text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-terracotta-500 text-white shadow-md">
              <FaMagic size={20} />
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-500">
              AI-powered travel discovery
            </p>

            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-teal-900 sm:text-5xl">
              TripAI Assistant
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-ink-500">
              Describe your ideal trip in your own words, and TripAI will find
              destinations across Nepal that match your preferences.
            </p>

          </section>
        )}


        {/* =========================================
            ASSISTANT WORKSPACE
        ========================================= */}

        {results.length > 0 ? (

          <section className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">

            {/* LEFT: USER REQUEST */}

            <aside className="lg:sticky lg:top-24 lg:self-start">

              <div className="rounded-2xl border border-ink-900/10 bg-white p-5 shadow-sm">

                <div className="flex items-center gap-2">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-terracotta-500/10 text-terracotta-500">
                    <FaMagic size={14} />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-teal-900">
                      Your trip
                    </h2>

                    <p className="text-xs text-ink-400">
                      Refine your request anytime
                    </p>
                  </div>

                </div>


                <form onSubmit={handleSubmit} className="mt-4">

                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handlePromptKeyDown}
                    disabled={loading}
                    rows={7}
                    placeholder="Describe your ideal trip in your own words..."
                    className="w-full resize-none rounded-xl border border-ink-900/10 bg-sand-50 px-3 py-3 text-sm leading-6 text-ink-900 outline-none transition focus:border-terracotta-500/50 focus:ring-2 focus:ring-terracotta-500/10 placeholder:text-ink-400 disabled:opacity-60"
                  />

                  <button
                    type="submit"
                    disabled={!query.trim() || loading}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-terracotta-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-terracotta-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Finding destinations...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane size={12} />
                        Find destinations
                      </>
                    )}
                  </button>

                </form>


                {/* AI UNDERSTANDING */}

                {aiResponse?.response_type === 'recommendation' &&
                  aiResponse?.nlp && (
                    <AIUnderstanding
                      nlp={aiResponse.nlp}
                      resultCount={results.length}
                    />
                  )}

              </div>

            </aside>


            {/* RIGHT: RESULTS */}

            <div>

              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <FaMagic
                      size={15}
                      className="text-terracotta-500"
                    />

                    <h2 className="font-display text-2xl font-semibold text-teal-900">
                      Recommended for you
                    </h2>

                  </div>

                  <p className="mt-1 text-sm text-ink-400">
                    Destinations ranked according to the preferences understood
                    from your request.
                  </p>

                </div>

                <span className="text-sm font-medium text-ink-400">
                  {results.length} destinations found
                </span>

              </div>


              {/* TOP RECOMMENDATION */}

              {results[0] && (
                <TopRecommendation
                  destination={results[0]}
                  nlp={aiResponse?.nlp}
                />
              )}


              {/* OTHER RECOMMENDATIONS */}

              {results.length > 1 && (
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">

                  {results.slice(1).map((destination, index) => (
                    <AIDestinationCard
                      key={
                        destination.destination_id ||
                        destination.id ||
                        index
                      }
                      destination={destination}
                      nlp={aiResponse?.nlp}
                    />
                  ))}

                </div>
              )}

            </div>

          </section>

        ) : (

          /* =========================================
            INITIAL PROMPT
          ========================================= */

          <section className="mx-auto mt-8 max-w-4xl">

            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-ink-900/10 bg-white p-3 shadow-lg"
            >

              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handlePromptKeyDown}
                disabled={loading}
                rows={4}
                placeholder="Describe your ideal trip in your own words..."
                className="w-full resize-none rounded-xl border-0 bg-transparent px-4 py-3 text-base leading-7 text-ink-900 outline-none placeholder:text-ink-400 disabled:opacity-60"
              />

              <div className="mt-2 flex flex-col gap-3 border-t border-ink-900/10 pt-3 sm:flex-row sm:items-center sm:justify-between">

                <p className="px-2 text-xs text-ink-400">
                  Mention your destination, budget, activities, duration, or travel style.
                </p>

                <button
                  type="submit"
                  disabled={!query.trim() || loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-terracotta-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-terracotta-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Finding destinations...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane size={12} />
                      Find destinations
                    </>
                  )}
                </button>

              </div>

            </form>


            {/* Example prompts */}

            <div className="mt-4 flex flex-wrap justify-center gap-2">

              {[
                'Peaceful trip near Pokhara',
                'Adventure and trekking',
                'Family trip with nature',
                'Cultural places and local food',
              ].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => handleExample(example)}
                  disabled={loading}
                  className="cursor-pointer rounded-full border border-ink-900/10 bg-white px-4 py-2 text-xs font-medium text-ink-500 shadow-sm transition hover:border-terracotta-500/40 hover:bg-terracotta-50 hover:text-teal-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {example}
                </button>
              ))}

            </div>

          </section>

        )}


        {/* =========================================
            SPECIAL AI RESPONSES
        ========================================= */}

        {!loading &&
          aiResponse &&
          results.length === 0 &&
          aiResponse.message && (
            <section className="mx-auto mt-12 max-w-2xl rounded-2xl border border-white/10 bg-[#F7F8F6] p-7 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-terracotta-50 text-terracotta-500">
                <FaMagic />
              </div>

              <p className="mt-4 text-base leading-7 text-ink-600">
                {aiResponse.message}
              </p>

            </section>
          )}


        {/* =========================================
            EMPTY STATE
        ========================================= */}

        {!loading &&
          !error &&
          !aiResponse && (
            <section className="mx-auto mt-16 max-w-2xl text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                <FaMapMarkerAlt />
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Your AI-matched destinations will appear here.
              </p>

            </section>
          )}

      </main>

    </div>
  )
}


/* =====================================================
   AI UNDERSTANDING
===================================================== */

function AIUnderstanding({ nlp, resultCount }) {

  const location =
    nlp.location ||
    nlp.destination ||
    null

  const activities = Array.isArray(nlp.activities)
    ? nlp.activities
    : []

  const moodTags = Array.isArray(nlp.mood_tags)
    ? nlp.mood_tags
    : []

  const budget = nlp.budget_npr
  const duration = nlp.duration_days
  const groupType = nlp.group_type

  const hasPreferences =
    location ||
    activities.length > 0 ||
    moodTags.length > 0 ||
    budget ||
    duration ||
    groupType

  if (!hasPreferences) return null

  return (
    <section className="mt-5">

        <div className="rounded-xl border border-terracotta-500/20 bg-terracotta-50 p-4">
        <div className="flex items-start gap-3">

          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-terracotta-500/10 text-terracotta-400">
            <FaMagic size={14} />
          </div>

          <div className="min-w-0 flex-1">

            <h3 className="text-sm font-semibold text-teal-900">
              TripAI understood your request
            </h3>

            <p className="mt-1 text-xs leading-5 text-ink-500">
              We used these preferences to rank {resultCount || 'the'} destination
              {resultCount === 1 ? '' : 's'}.
            </p>


            <div className="mt-4 flex flex-wrap gap-2">

              {location && (
                <PreferencePill>
                  <FaMapMarkerAlt size={10} />
                  {location}
                </PreferencePill>
              )}

              {duration && (
                <PreferencePill>
                  <FaCalendarAlt size={10} />
                  {duration} day{Number(duration) === 1 ? '' : 's'}
                </PreferencePill>
              )}

              {budget && (
                <PreferencePill>
                  <FaWallet size={10} />
                  Up to NPR {Number(budget).toLocaleString()}
                </PreferencePill>
              )}

              {groupType && (
                <PreferencePill>
                  <FaRoute size={10} />
                  {groupType}
                </PreferencePill>
              )}

              {activities.map((activity) => (
                <PreferencePill key={`activity-${activity}`}>
                  <FaCheckCircle size={10} />
                  {activity}
                </PreferencePill>
              ))}

              {moodTags.map((mood) => (
                <PreferencePill key={`mood-${mood}`}>
                  ✨ {mood}
                </PreferencePill>
              ))}

            </div>

          </div>

        </div>

      </div>

    </section>
  )
}


/* =====================================================
   PREFERENCE PILL
===================================================== */

function PreferencePill({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-ink-900/10 bg-white px-2.5 py-1.5 text-xs font-medium text-teal-900 shadow-sm">
      {children}
    </span>
  )
}


/* =====================================================
   TOP RECOMMENDATION
===================================================== */

function TopRecommendation({ destination, nlp }) {

  const name =
    destination.destination_name ||
    destination.name ||
    'Destination'

  const id =
    destination.destination_id ||
    destination.id

  const province =
    destination.province || ''

  const district =
    destination.district || ''

  const rating =
    Number(
      destination.average_rating ||
      destination.rating ||
      0
    )

  const budget =
    Number(
      destination.estimated_budget_npr ||
      destination.estimatedBudget ||
      0
    )

  const similarity =
    Number(
      destination.similarity_score ||
      destination.similarity ||
      0
    )

  const finalScore =
    Number(
      destination.final_score ||
      0
    )

  const description =
    destination.description ||
    'A destination selected by TripAI based on your travel request.'

  const activities = parseList(
    destination.activities
  )

  return (
    <article className="relative overflow-hidden rounded-3xl border border-terracotta-500/20 bg-[#F7F8F6] shadow-xl">

      <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-terracotta-500/10 blur-3xl" />

      <div className="relative grid lg:grid-cols-[0.9fr_1.1fr]">

        {/* Visual */}

        <div className="relative min-h-[270px] overflow-hidden bg-[#102D3B]">

          {destination.image_url ? (
            <img
              src={destination.image_url}
              alt={name}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.style.display = 'none'
              }}
              className="h-full min-h-[270px] w-full object-cover"
            />
          ) : (
            <div className="flex min-h-[270px] items-center justify-center bg-gradient-to-br from-[#183344] via-[#102432] to-[#0B1117] p-8">

              <div className="text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-terracotta-400">
                  <FaMapMarkerAlt size={24} />
                </div>

                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-terracotta-400">
                  Top AI match
                </p>

                <h3 className="mt-2 font-display text-3xl font-semibold text-white">
                  {name}
                </h3>

                <p className="mt-2 text-sm text-slate-300">
                  {district}
                  {district && province ? ', ' : ''}
                  {province}
                </p>

              </div>

            </div>
          )}

          {/* Image overlay */}

          {destination.image_url && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
          )}

          {/* Label */}

          {destination.image_url && (
            <div className="absolute bottom-5 left-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta-300">
                Top AI match
              </p>

              <h3 className="mt-1 font-display text-2xl font-semibold text-white drop-shadow-md">
                {name}
              </h3>
            </div>
          )}

        </div>


        {/* Content */}

        <div className="p-7 sm:p-8">

          <div className="flex flex-wrap items-start justify-between gap-4">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-400">
                Best match
              </p>

              <h3 className="mt-1 font-display text-2xl font-semibold text-teal-900">
                {name}
              </h3>

            </div>

            <div className="rounded-xl border border-teal-500/20 bg-teal-500/10 px-3 py-2 text-center">

              <div className="text-xl font-bold text-teal-700">
                {getMatchPercentage(
                  similarity,
                  finalScore
                )}%
              </div>

              <div className="text-[10px] uppercase tracking-wide text-slate-500">
                match
              </div>

            </div>

          </div>


          <div className="mt-5 flex flex-wrap gap-2">

            <InfoPill icon={<FaStar />} value={rating.toFixed(1)} />

            {budget > 0 && (
              <InfoPill
                icon={<FaWallet />}
                value={`NPR ${budget.toLocaleString()}`}
              />
            )}

            {destination.best_season && (
              <InfoPill
                icon={<FaCalendarAlt />}
                value={destination.best_season}
              />
            )}

          </div>


          <p className="mt-5 text-sm leading-7 text-ink-600">
            {description}
          </p>


          {activities.length > 0 && (
            <div className="mt-5">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Activities
              </p>

              <div className="mt-2 flex flex-wrap gap-2">

                {activities.slice(0, 5).map((activity) => (
                  <span
                    key={activity}
                    className="rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs text-teal-800"
                  >
                    {activity}
                  </span>
                ))}

              </div>

            </div>
          )}


          <div className="mt-6 flex flex-col gap-3 sm:flex-row">

            {id && (
              <Link
                to={`/destination/${id}`}
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-terracotta-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-terracotta-600"
              >
                Explore destination →
              </Link>
            )}

          </div>

        </div>

      </div>

    </article>
  )
}


/* =====================================================
   NORMAL AI CARD
===================================================== */

function AIDestinationCard({ destination, nlp }) {

  const name =
    destination.destination_name ||
    destination.name ||
    'Destination'

  const id =
    destination.destination_id ||
    destination.id

  const province =
    destination.province || ''

  const district =
    destination.district || ''

  const rating =
    Number(
      destination.average_rating ||
      destination.rating ||
      0
    )

  const budget =
    Number(
      destination.estimated_budget_npr ||
      destination.estimatedBudget ||
      0
    )

  const similarity =
    Number(
      destination.similarity_score ||
      destination.similarity ||
      0
    )

  const finalScore =
    Number(
      destination.final_score ||
      0
    )

  const description =
    destination.description ||
    'A destination selected by TripAI based on your travel request.'

  const activities = parseList(
    destination.activities
  )

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#F7F8F6] transition duration-300 hover:-translate-y-1 hover:border-terracotta-400/40 hover:shadow-xl">

      {/* Placeholder visual */}

      {/* Destination image */}

      <div className="relative h-40 overflow-hidden bg-[#102D3B]">

        {destination.image_url ? (
          <img
            src={destination.image_url}
            alt={name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.style.display = 'none'
            }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="relative flex h-full items-center justify-center bg-gradient-to-br from-[#183344] via-[#102432] to-[#0B1117]">

            <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-teal-500/20 blur-3xl" />

            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-terracotta-500/20 blur-3xl" />

            <div className="relative text-center">

              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-terracotta-400">
                <FaMapMarkerAlt />
              </div>

              <h3 className="mt-3 font-display text-xl font-semibold text-white">
                {name}
              </h3>

              <p className="mt-1 text-sm text-slate-300">
                {district}
                {district && province ? ', ' : ''}
                {province}
              </p>

            </div>

          </div>
        )}

        {destination.image_url && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        )}

      </div>


      <div className="flex flex-1 flex-col p-5">

        <div className="flex items-start justify-between gap-3">

          <div>

            <h3 className="font-display text-lg font-semibold text-teal-900">
              {name}
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              {district}
              {district && province ? ', ' : ''}
              {province}
            </p>

          </div>

          <div className="flex items-center gap-1 text-sm font-semibold text-teal-900">

            <FaStar
              size={12}
              className="text-terracotta-400"
            />

            {rating.toFixed(1)}

          </div>

        </div>


        <div className="mt-4 flex flex-wrap gap-2">

          {budget > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs text-ink-600">

              <FaWallet
                size={10}
                className="text-teal-400"
              />

              NPR {budget.toLocaleString()}

            </span>
          )}

          {destination.best_season && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs text-teal-800">

              <FaCalendarAlt
                size={10}
                className="text-teal-400"
              />

              {destination.best_season}

            </span>
          )}

        </div>


        {activities.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">

            {activities.slice(0, 3).map((activity) => (
              <span
                key={activity}
                className="rounded-md bg-teal-50 px-2 py-1 text-[11px] font-medium text-teal-800"
              >
                {activity}
              </span>
            ))}

          </div>
        )}


        <p className="mt-4 line-clamp-3 text-sm leading-6 text-ink-500">
          {description}
        </p>


        <div className="mt-4 flex items-center justify-between">

          <span className="text-xs font-medium text-teal-700">
            ✨ {getMatchPercentage(
              similarity,
              finalScore
            )}% preference match
          </span>

        </div>


        {id && (
          <Link
            to={`/destination/${id}`}
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-terracotta-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-terracotta-600"
          >
            Explore destination →
          </Link>
        )}

      </div>

    </article>
  )
}


/* =====================================================
   INFO PILL
===================================================== */

function InfoPill({ icon, value }) {

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-2 text-xs font-medium text-teal-800">

      <span className="text-teal-600">
        {icon}
      </span>

      {value}

    </span>
  )
}


/* =====================================================
   MATCH SCORE
===================================================== */

function getMatchPercentage(
  similarity,
  finalScore
) {

  /*
   * Similarity is the strongest semantic signal.
   * Final score includes rating/popularity.
   */

  let score = similarity

  if (!score && finalScore) {
    score = finalScore
  }

  if (!score) return 0

  return Math.min(
    99,
    Math.max(
      1,
      Math.round(score * 100)
    )
  )
}


/* =====================================================
   LIST PARSER
===================================================== */

function parseList(value) {

  if (!value) return []

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean)
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}