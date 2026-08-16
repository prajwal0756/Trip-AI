export default function LoadingSpinner({ size = 32, label = 'Loading' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12" role="status" aria-live="polite">
      <span
        className="animate-spin rounded-full border-3 border-teal-900/15 border-t-teal-900"
        style={{ width: size, height: size, borderWidth: Math.max(2, size / 12) }}
      />
      <span className="text-sm text-ink-500">{label}</span>
    </div>
  )
}
