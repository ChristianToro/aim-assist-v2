import { Link, NavLink } from 'react-router-dom'
import AuthControls from '../AuthControls/AuthControls'
import { useAuth } from '../../hooks/useAuth'

const navLinks = [
  { to: '/play', label: 'Play' },
  { to: '/leaderboards', label: 'Leaderboards' },
  { to: '/profile', label: 'Profile' },
  { to: '/settings', label: 'Settings' },
]

// On phones the links run edge to edge in their own row, so the outer two
// drop their side padding to line up with the page margins.
const linkClass = ({ isActive }) =>
  `py-3 text-caption font-medium whitespace-nowrap transition-colors first:pl-0 last:pr-0 sm:px-3 sm:py-2 sm:first:pl-3 sm:last:pr-3 ${
    isActive ? 'text-heading' : 'text-muted hover:text-heading'
  }`

// The current page carries the app's one selection mark: a 1px accent
// line exactly as wide as its label.
const labelClass = (isActive) =>
  `border-b pb-1 ${isActive ? 'border-accent' : 'border-transparent'}`

/*
 * The page links are for signed-in players only; signed-out visitors
 * (and the session restore, where user is still null) see the wordmark
 * and the sign-in button. Below `sm` the bar wraps: wordmark and account
 * on the first row, the four links across a second, so none is cut off.
 */
const Navbar = () => {
  const { user } = useAuth()

  return (
    <header className="bg-bg">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-2 px-4 sm:h-16 sm:flex-nowrap sm:px-6">
        <Link
          to="/"
          className="flex h-16 shrink-0 items-center gap-2 font-display text-caption text-heading sm:h-auto"
        >
          <span aria-hidden="true" className="text-accent">
            ◎
          </span>
          Aim Assist
        </Link>

        {user && (
          <div
            data-nav-links
            className="order-last flex w-full items-center justify-between sm:order-none sm:w-auto sm:justify-start sm:gap-1"
          >
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
