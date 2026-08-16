import { Link } from 'react-router-dom'
import { FaCompass } from 'react-icons/fa'
import Button from '../../components/shared/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center px-4 text-center">
      <FaCompass className="text-terracotta-400" size={48} />
      <h1 className="mt-6 font-display text-4xl font-medium text-ink-900">Lost the trail</h1>
      <p className="mt-3 max-w-sm text-sm text-ink-500">
        The page you're looking for doesn't exist, or may have moved. Let's get you back on route.
      </p>
      <Link to="/" className="mt-6">
        <Button>Back to home</Button>
      </Link>
    </div>
  )
}
