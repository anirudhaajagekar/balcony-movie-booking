import { Check } from 'lucide-react'
import { useStore } from '../store/useStore'
import { CITIES } from '../data/theatres'
import Modal from './Modal'

export default function CityPicker() {
  const city = useStore((s) => s.city)
  const cityChosen = useStore((s) => s.cityChosen)
  const open = useStore((s) => s.cityPickerOpen)
  const setCity = useStore((s) => s.setCity)
  const close = useStore((s) => s.closeCityPicker)

  // Ask on the first visit, then only when the person clicks the city button.
  const isOpen = open || !cityChosen

  return (
    <Modal open={isOpen} onClose={close} title="Which city are you in?">
      <p className="-mt-2 mb-5 text-sm text-muted">We’ll show cinemas and showtimes near you. You can change this any time.</p>
      <div className="grid grid-cols-2 gap-2">
        {CITIES.map((c) => {
          const selected = c === city && cityChosen
          return (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={`flex items-center justify-between rounded-md border px-4 py-3 text-left font-mono text-xs font-bold uppercase transition-colors ${
                selected ? 'border-accent bg-accent text-white' : 'border-line bg-ink hover:border-muted hover:bg-raised'
              }`}
            >
              {c}
              {selected && <Check className="size-4" aria-hidden="true" />}
            </button>
          )
        })}
      </div>
    </Modal>
  )
}