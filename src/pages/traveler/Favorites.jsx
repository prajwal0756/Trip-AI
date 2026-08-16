import { useState } from 'react'
import { FaHeart } from 'react-icons/fa'
import DestinationCard from '../../components/cards/DestinationCard'
import HomestayCard from '../../components/cards/HomestayCard'
import EmptyState from '../../components/shared/EmptyState'
import { useApp } from '../../context/AppContext'
import { destinations } from '../../data/destinations'

const tabs = [
  { key: 'destinations', label: 'Destinations' },
  { key: 'homestays', label: 'Homestays' },
]

export default function Favorites() {
  const { favoriteDestinations, favoriteHomestays, homestays } = useApp()
  const [tab, setTab] = useState('destinations')

  const favDestinations = destinations.filter((d) => favoriteDestinations.includes(d.id))
  const favHomestays = homestays.filter((h) => favoriteHomestays.includes(h.id))

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-ink-900">Favorites</h1>
      <p className="mt-1 text-sm text-ink-500">Destinations and homestays you've saved.</p>

      <div className="mt-6 flex gap-2 rounded-xl bg-white p-1.5 shadow-sm" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-teal-900 text-white' : 'text-ink-500 hover:bg-sand-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'destinations' ? (
          favDestinations.length === 0 ? (
            <EmptyState icon={<FaHeart />} title="No favorite destinations yet" description="Tap the heart icon on any destination to save it here." />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favDestinations.map((d) => (
                <DestinationCard key={d.id} destination={d} />
              ))}
            </div>
          )
        ) : favHomestays.length === 0 ? (
          <EmptyState icon={<FaHeart />} title="No favorite homestays yet" description="Tap the heart icon on any homestay to save it here." />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favHomestays.map((h) => (
              <HomestayCard key={h.id} homestay={h} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
