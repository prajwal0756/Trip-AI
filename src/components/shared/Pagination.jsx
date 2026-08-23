import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const getPages = () => {
    // Small number of pages: show everything
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages = []

    // Always show first page
    pages.push(1)

    // Near the beginning
    if (currentPage <= 4) {
      pages.push(2, 3, 4, 5, 'ellipsis-right', totalPages)

      return pages
    }

    // Near the end
    if (currentPage >= totalPages - 3) {
      pages.push(
        'ellipsis-left',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      )

      return pages
    }

    // Middle pages
    pages.push(
      'ellipsis-left',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      'ellipsis-right',
      totalPages
    )

    return pages
  }

  const pages = getPages()

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-1.5"
      aria-label="Pagination"
    >
      {/* Previous */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        <FaChevronLeft size={12} />
      </button>

      {/* Page numbers */}
      {pages.map((page, index) => {
        if (typeof page === 'string') {
          return (
            <span
              key={`${page}-${index}`}
              className="flex h-9 w-9 items-center justify-center text-sm text-ink-500"
            >
              ...
            </span>
          )
        }

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? 'bg-teal-900 text-white'
                : 'text-ink-700 hover:bg-white'
            }`}
          >
            {page}
          </button>
        )
      })}

      {/* Next */}
      <button
        onClick={() =>
          onPageChange(Math.min(totalPages, currentPage + 1))
        }
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        <FaChevronRight size={12} />
      </button>
    </nav>
  )
}