const variants = {
  primary: 'bg-terracotta-500 text-white hover:bg-terracotta-600 shadow-sm',
  secondary: 'bg-teal-900 text-white hover:bg-teal-700 shadow-sm dark:bg-teal-600 dark:hover:bg-teal-500',
  outline: 'border border-teal-900/20 text-teal-900 hover:bg-teal-900/5 dark:border-teal-500/30 dark:text-teal-400 dark:hover:bg-teal-500/10',
  ghost: 'text-teal-900 hover:bg-teal-900/5 dark:text-teal-400 dark:hover:bg-teal-500/10',
  danger: 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 dark:border-red-900/50',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  loading = false,
  className = '',
  ...rest
}) {
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="text-base">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="text-base">{icon}</span>}
        </>
      )}
    </button>
  )
}
