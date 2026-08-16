import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }).map((_, i) => i + 1)

  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 hover:bg-white disabled:opacity-30"
      >
        <FaChevronLeft size={12} />
      </button>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? 'page' : undefined}
          className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
            page === currentPage ? 'bg-teal-900 text-white' : 'text-ink-700 hover:bg-white'
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 hover:bg-white disabled:opacity-30"
      >
        <FaChevronRight size={12} />
      </button>
    </nav>
  )
}
