import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa'
import { useApp } from '../../context/AppContext'

const styles = {
  success: 'bg-teal-900 text-white',
  danger: 'bg-red-600 text-white',
}

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp()

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg ${styles[toast.type] || styles.success} animate-[slideIn_0.2s_ease-out]`}
        >
          {toast.type === 'danger' ? <FaExclamationCircle /> : <FaCheckCircle />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
            className="ml-2 text-white/70 hover:text-white"
          >
            <FaTimes size={12} />
          </button>
        </div>
      ))}
    </div>
  )
}
