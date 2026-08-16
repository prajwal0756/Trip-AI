import { FaBullseye, FaMagic, FaHeart, FaUsers } from 'react-icons/fa'

const features = [
  { icon: FaMagic, title: 'AI-assisted matching', text: 'We translate your stated preferences into a ranked set of destinations and homestays using a transparent scoring approach.' },
  { icon: FaHeart, title: 'Community reviews', text: 'Every rating shown comes from real traveler reviews, not promotional placement.' },
  { icon: FaUsers, title: 'Built for local hosts', text: 'Homestay owners get simple tools to list, manage, and grow their bookings.' },
]

export default function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-sm font-medium text-terracotta-500">About TripAI</p>
        <h1 className="mt-2 font-display text-3xl font-medium text-ink-900 sm:text-4xl">
          Travel planning that starts with how you want to feel, not where everyone else goes.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-ink-500">
          TripAI is a final-year engineering project exploring how natural-language preferences and review sentiment
          can be combined to recommend destinations and homestays — built around Nepal's diverse regions, from lakeside
          cities to tea-garden hills.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <f.icon size={18} />
            </div>
            <h3 className="mt-4 font-display text-base font-medium text-ink-900">{f.title}</h3>
            <p className="mt-2 text-sm text-ink-500">{f.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 rounded-3xl bg-teal-900 p-10 text-center sm:p-14">
        <FaBullseye className="mx-auto text-terracotta-400" size={28} />
        <h2 className="mt-4 font-display text-2xl font-medium text-white">Our objective</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-sand-100/80">
          To demonstrate an end-to-end recommendation pipeline — from a traveler's stated preferences to a ranked,
          explained shortlist of destinations and homestays — using structured features today, with room to plug in
          NLP-based intent extraction and sentiment-ranked reviews as the system matures.
        </p>
      </div>
    </div>
  )
}
