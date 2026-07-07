import { Outlet } from 'react-router-dom'
import Navbar from '../Navbar/Navbar'
import Footer from '../Footer/Footer'

// App shell: every routed page renders inside <Outlet />.
const Layout = () => (
  <div className="flex min-h-screen flex-col bg-bg text-body">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
)

export default Layout
