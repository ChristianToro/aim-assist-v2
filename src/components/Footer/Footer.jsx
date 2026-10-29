import { Link } from 'react-router-dom'

const footerLinks = [
  { to: '/leaderboards', label: 'Leaderboards' },
  { to: '/settings', label: 'Settings' },
]

const YEAR = new Date().getFullYear()

// One quiet line: what this is, the public pages, the year.
const Footer = () => (
  <footer className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-caption text-muted sm:flex-row sm:items-baseline sm:justify-between sm:px-6">
    <p>Aim Assist, a browser aim trainer</p>
    <nav aria-label="Footer" className="flex gap-6">
      {footerLinks.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          className="underline decoration-transparent underline-offset-4 transition-colors hover:text-heading hover:decoration-current"
        >
          {label}
        </Link>
      ))}
    </nav>
    <p>© {YEAR}</p>
  </footer>
)

export default Footer
