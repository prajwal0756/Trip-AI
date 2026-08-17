import { FaSearch } from 'react-icons/fa'

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  className = '',
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()

      if (onSearch) {
        onSearch(value.trim())
      }
    }
  }

  return (
    <div className={`relative ${className}`}>
      <FaSearch
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-500/50"
        size={14}
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-xl border border-ink-900/10 bg-white py-3 pl-11 pr-4 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-teal-500 focus:outline-none"
      />
    </div>
  )
}