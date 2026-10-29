import { Link, NavLink } from 'react-router-dom'
import AuthControls from '../AuthControls/AuthControls'
import { useAuth } from '../../hooks/useAuth'

const navLinks = [
  { to: '/play', label: 'Play' },
  { to: '/leaderboards', label: 'Leaderboards' },
  { to: '/profile', label: 'Profile' },
  { to: '/settings', label: 'Settings' },
]

const linkClass = ({ isActive }) =>
  `px-2.5 py-2 text-caption font-medium whitespace-nowrap transition-colors sm:px-3 ${
    isActive ? 'text-heading' : 'text-muted hover:text-heading'
  }`

// The current page carries the app's one selection mark: a 1px accent
// line exactly as wide as its label.
const labelClass = (isActive) =>
  `border-b pb-1 ${isActive ? 'border-accent' : 'border-transparent'}`

// The page links are for signed-in players only; signed-out visitors
// (and the session restore, where user is still null) see the wordmark
// and the sign-in button.
const Navbar = () => {
  const { user } = useAuth()

  return (
    <header className="bg-bg">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 font-display text-caption text-heading"
        >
          <span aria-hidden="true" className="text-accent">
            ◎
          </span>
          <span className="hidden min-[420px]:inline">Aim Assist</span>
        </Link>

        {user && (
          <div className="flex items-center gap-1 overflow-x-auto">
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} className={linkClass}>
                {({ isActive }) => (
                  <span className={labelClass(isActive)}>{label}</span>
                )}
              </NavLink>
            ))}
          </div>
        )}

        <div className="shrink-0">
          <AuthControls />
        </div>
      </nav>
    </header>
  )
}

export default Navbar
