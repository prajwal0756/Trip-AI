export default function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-ink-500">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-ink-900/10 bg-white px-3.5 py-2.5 text-sm text-ink-900 focus:border-teal-500 focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </div>
  )
}
