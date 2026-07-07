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
    <div className="flex min-h-screen flex-col bg-bg text-body">
      <Navbar />
      <main className="flex-1">
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
