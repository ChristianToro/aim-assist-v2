import { Link, NavLink } from 'react-router-dom'
import AuthControls from '../AuthControls/AuthControls'

const navLinks = [
  { to: '/play', label: 'Play' },
  { to: '/leaderboards', label: 'Leaderboards' },
  { to: '/profile', label: 'Profile' },
  { to: '/settings', label: 'Settings' },
]

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-surface text-heading'
      : 'text-muted hover:bg-surface hover:text-heading'
  }`

const Navbar = () => (
  <header className="sticky top-0 z-10 border-b border-edge bg-bg/80 backdrop-blur">
    <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
      <Link
        to="/"
        className="flex items-center gap-2 text-lg font-semibold tracking-tight text-heading"
      >
        <span aria-hidden="true" className="text-accent">
          ◎
        </span>
        Aim Assist
      </Link>

      <div className="flex items-center gap-1">
        {navLinks.map(({ to, label }) => (
          <NavLink key={to} to={to} className={linkClass}>
            {label}
          </NavLink>
        ))}
      </div>

      <div className="hidden sm:block">
        <AuthControls />
      </div>
    </nav>
  </header>
)

export default Navbar
