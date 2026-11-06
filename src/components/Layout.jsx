import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar, { Logo } from './Navbar'
import CityPicker from './CityPicker'
import Toast from './Toast'
import AgentLayer, { AgentDock, ScrollRail } from './AgentLayer'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function Footer() {
  return (
    <footer className="mt-28 border-t border-line pb-24 print:hidden">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Logo />
        <p className="max-w-md font-mono text-xs leading-relaxed text-muted uppercase">
          Demo project built with React. Movies, cinemas and payments are fictional. No real money changes hands.
        </p>
      </div>
    </footer>
  )
}

export default function Layout() {
  return (
    // `relative` lets the agent cursors position themselves anywhere on the page.
    <div className="relative flex min-h-dvh flex-col overflow-x-clip">
      <ScrollToTop />
      <ScrollRail />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AgentLayer />
      <AgentDock />
      <CityPicker />
      <Toast />
    </div>
  )
}