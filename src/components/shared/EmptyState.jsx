export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-900/15 bg-white/50 px-6 py-16 text-center">
      {icon && <div className="mb-4 text-4xl text-ink-500/50">{icon}</div>}
      <h3 className="font-display text-lg font-medium text-ink-900">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
