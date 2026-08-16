export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      <div className="h-44 w-full animate-pulse rounded-xl bg-sand-200" />
      <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-sand-200" />
      <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-sand-200" />
      <div className="mt-4 h-3 w-full animate-pulse rounded bg-sand-200" />
    </div>
  )
}

export function CardSkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export function TableRowSkeleton({ columns = 4 }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-3 w-full animate-pulse rounded bg-sand-200" />
        </td>
      ))}
    </tr>
  )
}
