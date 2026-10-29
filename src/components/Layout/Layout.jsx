import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../Navbar/Navbar'
import Footer from '../Footer/Footer'
import LoadingScreen from '../LoadingScreen/LoadingScreen'

// App shell: every routed page renders inside <Outlet />. The keyed
// wrapper replays a subtle fade/slide on navigation; Suspense covers
// lazy page chunks without unmounting the nav or footer.
const Layout = () => {
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-svh flex-col bg-bg text-body">
      <a
        href="#main"
        className="sr-only rounded-lg bg-accent px-4 py-2 font-medium text-on-accent focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        <Suspense fallback={<LoadingScreen />}>
          <div key={pathname} className="animate-fade-in-up">
            <Outlet />
          </div>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default Layout
