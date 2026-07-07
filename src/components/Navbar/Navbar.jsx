import { Link, NavLink } from 'react-router-dom'

const navLinks = [
  { to: '/play', label: 'Play' },
  { to: '/leaderboards', label: 'Leaderboards' },
  { to: '/profile', label: 'Profile' },
  { to: '/settings', label: 'Settings' },
]

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-zinc-800 text-white'
      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
  }`

const Navbar = () => (
  <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
    <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
      <Link
        to="/"
        className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white"
      >
        <span aria-hidden="true" className="text-cyan-400">
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

      {/* Placeholder until Google auth lands in Milestone 14 */}
      <button
        type="button"
        disabled
        title="Sign-in coming soon"
        className="hidden cursor-not-allowed rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-500 sm:block"
      >
        Continue with Google
      </button>
    </nav>
  </header>
)

export default Navbar
