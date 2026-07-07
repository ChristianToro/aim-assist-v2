import { Link } from 'react-router-dom'

const NotFound = () => (
  <section className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:px-6">
    <p className="text-6xl font-semibold tracking-tight text-cyan-400">404</p>
    <h1 className="mt-4 text-2xl font-semibold text-white">Target not found</h1>
    <p className="mt-2 text-zinc-400">
      This page doesn&apos;t exist — that one&apos;s a miss.
    </p>
    <Link
      to="/"
      className="mt-8 rounded-lg bg-cyan-500 px-5 py-2.5 font-medium text-zinc-950 transition-colors hover:bg-cyan-400"
    >
      Back to Home
    </Link>
  </section>
)

export default NotFound
