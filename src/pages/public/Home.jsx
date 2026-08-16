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
    navigate(query ? `/destinations?q=${encodeURIComponent(query)}` : '/destinations')
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

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pb-24 sm:pt-28 lg:px-8 lg:pb-28 lg:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md border border-white/15 shadow-sm transition-colors hover:bg-white/15">
              <FaMagic size={12} className="text-terracotta-400" /> AI-matched destinations & homestays
            </p>
            <h1 className="font-display text-4xl font-medium leading-tight text-white sm:text-5xl drop-shadow-sm">
              Find a place that feels like it was picked just for you.
            </h1>
            <p className="mt-4 text-base text-sand-100/90 sm:text-lg font-normal leading-relaxed">
              Tell TripAI your travel style and budget — we'll match you to destinations and homestays across Nepal that fit, backed by real traveler reviews.
            </p>

                    {/* Search bar overlapping hero/content boundary */}
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            onSubmit={handleSearch}
            className="-mb-8 flex flex-col gap-3 rounded-2xl bg-white/85 dark:bg-navy-900/80 p-3 shadow-md shadow-navy-950/10 dark:shadow-black/40 backdrop-blur-xl border border-white/60 dark:border-white/15 sm:flex-row sm:items-center transition-all duration-200"
          >
            <div className="relative flex-1">
              <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-300" size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by destination, region, or travel style…"
                className="w-full rounded-xl bg-transparent py-3.5 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-500/70 dark:placeholder:text-slate-400/70 focus:outline-none"
              />
            </div>
            <Button type="submit" size="md">
              Search
            </Button>
          </motion.form>
        </div>
        </motion.div>
      </div>
      </section>

      {/* Popular Destinations */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:pt-28 pb-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-terracotta-500">Handpicked</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-[#10263A] dark:text-[#F5F3EE] sm:text-3xl">
              Popular destinations
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/destinations')} className="text-[#10263A] hover:text-terracotta-500 dark:text-[#AAB5C0] dark:hover:text-white font-medium">
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
            <h2 className="mt-1 font-display text-2xl font-semibold text-[#10263A] dark:text-[#F5F3EE] sm:text-3xl">
              Featured homestays
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/homestays')} className="text-[#10263A] hover:text-terracotta-500 dark:text-[#AAB5C0] dark:hover:text-white font-medium">
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
                <FaMagic size={12} className="text-terracotta-400" /> Powered by your preferences
              </p>
              <h2 className="mt-4 font-display text-2xl font-semibold text-white sm:text-3xl">
                Not sure where to go? Let TripAI suggest it.
              </h2>
              <p className="mt-3 text-sm text-sand-100/85 leading-relaxed">
                Answer a few quick questions about your budget, travel style, and the activities you enjoy. We'll rank destinations and homestays that actually fit — with the reasoning shown, not just a list.
              </p>
              <Button className="mt-6 bg-terracotta-500 hover:bg-terracotta-600 text-white font-medium shadow-md" onClick={() => navigate('/recommendations')}>
                Get my recommendations
              </Button>
            </div>
            <div className="h-64 lg:h-full">
              <img
                src="https://images.unsplash.com/photo-1606298855672-3efb63017af8?w=900&q=80"
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
          <h2 className="mt-1 font-display text-2xl font-semibold text-[#10263A] dark:text-[#F5F3EE] sm:text-3xl">
            Built for how you actually plan trips
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { icon: FaMagic, title: 'Personalized matching', text: 'Recommendations based on your budget, travel style, and activities — not generic top-10 lists.' },
            { icon: FaShieldAlt, title: 'Verified homestays', text: 'Every homestay is reviewed by real travelers, with ratings you can actually trust.' },
            { icon: FaLeaf, title: 'Local, sustainable stays', text: 'Stay with local families and small hosts instead of large chain hotels.' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl bg-[#FFFCF7] dark:bg-[#121C27] border border-navy-900/10 dark:border-white/10 p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sand-200/60 dark:bg-white/10 text-[#10263A] dark:text-amber-400">
                <item.icon size={18} />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-[#10263A] dark:text-[#F5F3EE]">{item.title}</h3>
              <p className="mt-2 text-sm text-ink-500 dark:text-[#AAB5C0] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-terracotta-500">Traveler stories</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-[#10263A] dark:text-[#F5F3EE] sm:text-3xl">
            What travelers are saying
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {testimonials.map((review) => (
            <div key={review.id} className="rounded-2xl bg-[#FFFCF7] dark:bg-[#121C27] border border-navy-900/10 dark:border-white/10 p-6 shadow-sm">
              <FaComments className="text-terracotta-400" size={20} />
              <p className="mt-4 text-sm text-ink-700 dark:text-[#AAB5C0] leading-relaxed">"{review.comment}"</p>
              <div className="mt-4 flex items-center gap-3">
                <img src={review.avatar} alt={review.travelerName} className="h-9 w-9 rounded-full object-cover" />
                <p className="text-sm font-medium text-[#10263A] dark:text-[#F5F3EE]">{review.travelerName}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-5 rounded-3xl bg-terracotta-500 dark:bg-[#121C27] border border-transparent dark:border-white/10 p-10 text-center sm:p-14 shadow-xl transition-colors duration-200">
          <h2 className="font-display text-2xl font-semibold text-white dark:text-[#F5F3EE] sm:text-3xl">
            Ready to find your next stay?
          </h2>
          <p className="max-w-md text-sm text-white/90 dark:text-[#AAB5C0] leading-relaxed">
            Create a free account and get personalized destination and homestay recommendations in under a minute.
          </p>
          <Button
            variant="secondary"
            className="cursor-pointer dark:bg-terracotta-500 dark:hover:bg-terracotta-600 dark:text-white"
            onClick={() => navigate('/register')}
          >
            Create free account
          </Button>
        </div>
      </section>
    </div>
  )
}
