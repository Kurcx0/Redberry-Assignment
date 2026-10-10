import { matchPath, Outlet, ScrollRestoration, useLocation } from 'react-router'
import LoginModal from '@/components/auth/LoginModal'
import RegisterModal from '@/components/auth/RegisterModal'
import SearchOverlay from '@/components/search/SearchOverlay'
import Toaster from '@/components/ui/Toaster'
import Footer from './Footer'
import Header from './Header'

const overlayRoutes = ['/', '/movies/:slug']

export default function Layout() {
  const { pathname } = useLocation()
  const overlay = overlayRoutes.some((pattern) => matchPath(pattern, pathname))

  return (
    <div className="mx-auto flex min-h-screen max-w-[1920px] flex-col">
      <Header overlay={overlay} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <SearchOverlay />
      <LoginModal />
      <RegisterModal />
      <Toaster />
      <ScrollRestoration />
    </div>
  )
}
