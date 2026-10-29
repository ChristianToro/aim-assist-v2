import { lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthProvider from './contexts/AuthProvider'
import ThemeProvider from './contexts/ThemeProvider'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'

// Route-level code splitting: each page loads on first visit
// (Layout shows LoadingScreen via Suspense while a chunk downloads).
const Home = lazy(() => import('./pages/Home'))
const Play = lazy(() => import('./pages/Play'))
const Leaderboards = lazy(() => import('./pages/Leaderboards'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const NotFound = lazy(() => import('./pages/NotFound'))

// The route table on its own, so tests can mount it in a MemoryRouter.
// Playing and the profile need a signed-in player; the boards and
// settings stay public.
export const AppRoutes = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="leaderboards" element={<Leaderboards />} />
      <Route element={<ProtectedRoute />}>
        <Route path="play" element={<Play />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="settings" element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
)

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
)

export default App
