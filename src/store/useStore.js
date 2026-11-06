import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// localStorage can throw (private mode, blocked storage), so wrap it.
const safeStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value)
    } catch {
      /* ignore */
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  },
}

export const HOLD_MINUTES = 5

const newBookingId = () =>
  'BLC' + Date.now().toString(36).toUpperCase().slice(-5) + Math.random().toString(36).slice(2, 5).toUpperCase()

export const useStore = create(
  persist(
    (set, get) => ({
      // ----- City -----
      city: 'Mumbai',
      cityChosen: false,
      cityPickerOpen: false,
      setCity: (city) => set({ city, cityChosen: true, cityPickerOpen: false }),
      openCityPicker: () => set({ cityPickerOpen: true }),
      closeCityPicker: () => set({ cityPickerOpen: false, cityChosen: true }),

      // ----- Seat hold -----
      // Seats chosen on the seat map are held for HOLD_MINUTES while paying.
      hold: null, // { showId, seats: [...], expiresAt }
      startHold: (showId, seats) =>
        set({ hold: { showId, seats, expiresAt: Date.now() + HOLD_MINUTES * 60 * 1000 } }),
      clearHold: () => set({ hold: null }),

      // ----- Bookings -----
      bookings: [],
      lastContact: null,
      createBooking: ({ showId, seats, totals, contact, paymentMethod }) => {
        const booking = {
          id: newBookingId(),
          showId,
          seats,
          totals,
          contact,
          paymentMethod,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        }
        set({ bookings: [booking, ...get().bookings], lastContact: contact, hold: null })
        return booking
      },
      cancelBooking: (id) =>
        set({
          bookings: get().bookings.map((b) =>
            b.id === id ? { ...b, status: 'cancelled', cancelledAt: new Date().toISOString() } : b,
          ),
        }),

      // ----- Agent cursors (the "agentic build" effect from the reel) -----
      agentsOn: !(typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches),
      agentSpeed: 1,
      touring: false,
      bottomBarOpen: false, // seat page booking bar is showing, so the dock moves up
      toggleAgents: () => set({ agentsOn: !get().agentsOn }),
      cycleSpeed: () => set({ agentSpeed: get().agentSpeed === 1 ? 2 : 1 }),
      setTouring: (touring) => set({ touring }),
      setBottomBarOpen: (bottomBarOpen) => set({ bottomBarOpen }),

      // ----- Toast -----
      toast: null,
      showToast: (message) => set({ toast: { message, id: Date.now() } }),
      hideToast: () => set({ toast: null }),
    }),
    {
      name: 'balcony-store',
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        city: s.city,
        cityChosen: s.cityChosen,
        hold: s.hold,
        bookings: s.bookings,
        lastContact: s.lastContact,
        agentsOn: s.agentsOn,
        agentSpeed: s.agentSpeed,
      }),
    },
  ),
)