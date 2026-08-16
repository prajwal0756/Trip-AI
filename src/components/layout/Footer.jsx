import { Link } from 'react-router-dom'
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy-950 text-sand-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-xl font-semibold text-white">
              Trip<span className="text-terracotta-400">AI</span>
            </p>
            <p className="mt-3 text-sm text-sand-100/70">
              AI-assisted travel and homestay recommendations across Nepal, built for travelers who'd rather explore than search.
            </p>
            <div className="mt-4 flex gap-3 text-sand-100/70">
              <a href="#" aria-label="Facebook" className="hover:text-white"><FaFacebook size={16} /></a>
              <a href="#" aria-label="Instagram" className="hover:text-white"><FaInstagram size={16} /></a>
              <a href="#" aria-label="Twitter" className="hover:text-white"><FaTwitter size={16} /></a>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-white">Explore</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-sand-100/70">
              <li><Link to="/destinations" className="hover:text-white">Destinations</Link></li>
              <li><Link to="/homestays" className="hover:text-white">Homestays</Link></li>
              <li><Link to="/recommendations" className="hover:text-white">AI Recommendations</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-white">Company</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-sand-100/70">
              <li><Link to="/about" className="hover:text-white">About</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-white">For homestay owners</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-sand-100/70">
              <li><Link to="/register" className="hover:text-white">List your homestay</Link></li>
              <li><Link to="/owner" className="hover:text-white">Owner dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-sand-100/50">
          © {new Date().getFullYear()} TripAI. Built as a final-year engineering project.
        </div>
      </div>
    </footer>
  )
}
