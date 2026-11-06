import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, dismissible = true, width = 'max-w-md' }) {
  const panelRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const prevFocus = document.activeElement
    const onKey = (e) => {
      if (e.key === 'Escape' && dismissible) onCloseRef.current?.()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    // Focus the first button or input inside the dialog.
    const first = panelRef.current?.querySelector('input, button:not([data-close]), a')
    first?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prevFocus?.focus?.()
    }
  }, [open, dismissible])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center print:hidden">
      <div
        className="absolute inset-0 animate-fade bg-black/70 backdrop-blur-sm"
        onClick={dismissible ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative w-full ${width} animate-rise rounded-xl border border-line bg-panel p-6 shadow-2xl shadow-black/70`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="modal-title" className="heading text-2xl">
            {title}
          </h2>
          {dismissible && (
            <button
              data-close
              onClick={onClose}
              className="-m-1 rounded-full p-1 text-muted hover:bg-raised hover:text-fg"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}