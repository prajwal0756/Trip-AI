import { useState, useEffect, useRef } from 'react'

/**
 * Simulates a brief loading state whenever any value in `deps` changes.
 * Used on list pages to show skeleton loaders on filter/search changes,
 * mimicking what a real API-backed page would feel like.
 */
export function useDelayedLoading(deps = [], delay = 350) {
  const [loading, setLoading] = useState(false)
  const isFirstRun = useRef(true)

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), delay)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return loading
}
