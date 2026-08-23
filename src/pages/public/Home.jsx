import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaSearch, FaMagic, FaShieldAlt, FaLeaf, FaComments } from 'react-icons/fa'
import DestinationCard from '../../components/cards/DestinationCard'
import HomestayCard from '../../components/cards/HomestayCard'
import Button from '../../components/shared/Button'
import { destinations } from '../../data/destinations'
import { homestays } from '../../data/homestays'
import { reviews } from '../../data/reviews'

const popularDestinations = destinations.slice(0, 3)
const featuredHomestays = homestays.slice(0, 3)
const testimonials = reviews.slice(0, 3)

export default function Home() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/ai-assistant${query ? `?q=${encodeURIComponent(query)}` : ''}`)
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-navy-900 dark:bg-navy-950 text-white transition-colors duration-300">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&q=80"
            alt="Nepal Mountain Panorama"
            className="h-full w-full object-cover opacity-50 dark:opacity-25 transition-opacity duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/70 to-navy-800/40 dark:from-navy-950 dark:via-navy-950/95 dark:to-navy-900/60 transition-colors duration-300" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="relative mx-auto flex min-h-[680px] max-w-7xl items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-full max-w-4xl text-center"
          >
            <p className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md border border-white/15 shadow-sm transition-colors hover:bg-white/15">
              <FaMagic size={12} className="text-terracotta-400" /> AI-matched destinations & homestays
            </p>
            <h1 className="mx-auto max-w-4xl font-display text-4xl font-medium leading-[1.08] text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
              Find a place that feels like it was picked just for <span className="text-terracotta-400">you.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base font-normal leading-relaxed text-sand-100/90 sm:text-lg">
                 Tell us what you’re looking for, and let TripAI turn your travel ideas into personalized places to explore.           
            </p>

                    {/* Search bar overlapping hero/content boundary */}
        {/* AI Prompt Search */}
        <div className="mx-auto mt-10 max-w-3xl">
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            onSubmit={handleSearch}
            className="flex flex-col gap-2 rounded-2xl bg-white/95 p-2 shadow-2xl shadow-black/20 backdrop-blur-xl sm:flex-row sm:items-center"
          >
            <div className="relative flex-1">
              <FaMagic
                className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-terracotta-400"
                size={16}
              />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask TripAI anything about your trip..."
                className="w-full rounded-xl bg-transparent py-4 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none sm:text-base"
              />
            </div>

            <Button
              type="submit"
              size="md"
              className="shrink-0 px-7 py-3.5"
            >
              Search →
            </Button>
          </motion.form>

          <p className="mt-4 text-sm italic text-white/80">
            Try: "Peaceful places in Nepal for nature and relaxation"
          </p>
        </div>
        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-white/90">
          <span className="flex items-center gap-2">
            <FaMagic className="text-terracotta-400" />
            AI-Powered
          </span>

          <span className="flex items-center gap-2">
            <FaComments className="text-terracotta-400" />
            Traveler Reviewed
          </span>

          <span className="flex items-center gap-2">
            <FaShieldAlt className="text-terracotta-400" />
            Trusted & Safe
          </span>

          <span className="flex items-center gap-2">
            <FaLeaf className="text-terracotta-400" />
            Made for You
          </span>
        </div>
        </motion.div>
      </div>
      </section>

      {/* Popular Destinations */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:pt-28 pb-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-terracotta-500">Handpicked</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-[#10263A] sm:text-3xl">
              Popular destinations
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/destinations')} className="text-[#10263A] hover:text-terracotta-500 font-medium">
            View all →
          </Button>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {popularDestinations.map((d) => (
            <DestinationCard key={d.id} destination={d} />
          ))}
        </div>
      </section>

      {/* Featured Homestays */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-terracotta-500">Stay local</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-[#10263A] sm:text-3xl">
              Featured homestays
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/homestays')} className="text-[#10263A] hover:text-terracotta-500 font-medium">
            View all →
          </Button>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredHomestays.map((h) => (
            <HomestayCard key={h.id} homestay={h} />
          ))}
        </div>
      </section>

      {/* AI Recommendation Section */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-navy-950 border border-white/10 text-white shadow-xl">
          <div className="grid grid-cols-1 items-center lg:grid-cols-2">
            <div className="p-8 sm:p-12">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md border border-white/15">
                <FaMagic size={12} className="text-terracotta-400" /> ✨ Powered by TripAI
              </p>
              <h2 className="mt-4 font-display text-2xl font-semibold text-white sm:text-3xl">
                Tell us where you want to go. We'll help you find it.
              </h2>
              <p className="mt-3 text-sm text-sand-100/85 leading-relaxed">
                Describe your ideal trip in your own words, and TripAI will recommend destinations that match your preferences.
              </p>
              <Button className="mt-6 bg-terracotta-500 hover:bg-terracotta-600 text-white font-medium shadow-md" onClick={() => navigate('/recommendations')}>
                Try TripAI Assistant →
              </Button>
            </div>
            <div className="h-64 lg:h-full">
              <img
                src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=900&q=80"
                alt="Traveler planning a trip"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose TripAI */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-terracotta-500">Why TripAI</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-[#10263A] sm:text-3xl">
            Built for how you actually plan trips
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { icon: FaMagic, title: 'Personalized matching', text: 'Recommendations based on your budget, travel style, and activities — not generic top-10 lists.' },
            { icon: FaShieldAlt, title: 'Verified homestays', text: 'Every homestay is reviewed by real travelers, with ratings you can actually trust.' },
            { icon: FaLeaf, title: 'Local, sustainable stays', text: 'Stay with local families and small hosts instead of large chain hotels.' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl bg-[#FFFCF7] border border-navy-900/10 p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sand-200/60 text-[#10263A]">
                <item.icon size={18} />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-[#10263A]">{item.title}</h3>
              <p className="mt-2 text-sm text-ink-500 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-terracotta-500">Traveler stories</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-[#10263A] sm:text-3xl">
            What travelers are saying
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {testimonials.map((review) => (
            <div key={review.id} className="rounded-2xl bg-[#FFFCF7] border border-navy-900/10 p-6 shadow-sm">
              <FaComments className="text-terracotta-400" size={20} />
              <p className="mt-4 text-sm text-ink-700 leading-relaxed">"{review.comment}"</p>
              <div className="mt-4 flex items-center gap-3">
                <img src={review.avatar} alt={review.travelerName} className="h-9 w-9 rounded-full object-cover" />
                <p className="text-sm font-medium text-[#10263A]">{review.travelerName}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-5 rounded-3xl bg-terracotta-500 border border-transparent  p-10 text-center sm:p-14 shadow-xl transition-colors duration-200">
          <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
            Your next trip starts here.
          </h2>
          <p className="max-w-md text-sm text-white/90 leading-relaxed">
            Tell TripAI what you’re looking for and discover destinations and homestays matched to your travel style.
          </p>
          <Button
            variant="secondary"
            className="cursor-pointer "
            onClick={() => navigate('/register')}
          >
            Start exploring →
          </Button>
        </div>
      </section>
    </div>
  )
}
