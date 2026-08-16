const statusStyles = {
  upcoming: 'bg-teal-50 text-teal-700',
  completed: 'bg-forest-400/15 text-forest-600',
  cancelled: 'bg-red-50 text-red-700',
  pending: 'bg-amber-50 text-amber-700',
  available: 'bg-forest-400/15 text-forest-600',
  limited: 'bg-amber-50 text-amber-700',
  unavailable: 'bg-red-50 text-red-700',
}

export default function Badge({ children, status, className = '' }) {
  const key = (status || children)?.toString().toLowerCase()
  const style = statusStyles[key] || 'bg-ink-900/5 text-ink-700'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${style} ${className}`}>
      {children}
    </span>
  )
}
