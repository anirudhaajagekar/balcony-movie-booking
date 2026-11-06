import { useEffect } from 'react'
import { useStore } from '../store/useStore'

export default function Toast() {
  const toast = useStore((s) => s.toast)
  const hideToast = useStore((s) => s.hideToast)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(hideToast, 3500)
    return () => clearTimeout(t)
  }, [toast, hideToast])

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 print:hidden">
      {toast && (
        <div
          key={toast.id}
          className="pointer-events-auto animate-rise rounded-full border border-line bg-raised px-5 py-3 text-sm font-medium text-fg shadow-xl shadow-black/40"
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}