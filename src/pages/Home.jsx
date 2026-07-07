import { Link } from 'react-router-dom'

const gameModes = [
  { name: 'Precision', description: 'Large targets. Pure accuracy.' },
  {
    name: 'Speed',
    description: 'Small targets, fast spawns, big multipliers.',
  },
  { name: 'Gridshot', description: 'Three targets up at all times.' },
  { name: 'Tracking', description: 'Follow targets as they bounce around.' },
  { name: 'Flick', description: 'Targets vanish fast — snap to them.' },
  { name: 'Survival', description: 'Ever harder. Miss too much and it ends.' },
]

const Home = () => (
  <>
    {/* Hero */}
    <section className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
      <h1 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        Train your aim,{' '}
        <span className="text-cyan-400">track your progress</span>
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
        A browser-based aim trainer with six game modes, live statistics, and
        global leaderboards. No install required.
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <Link
          to="/play"
          className="rounded-lg bg-cyan-500 px-5 py-2.5 font-medium text-zinc-950 transition-colors hover:bg-cyan-400"
        >
          Start Training
        </Link>
        <Link
          to="/leaderboards"
          className="rounded-lg border border-zinc-700 px-5 py-2.5 font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
        >
          Leaderboards
        </Link>
      </div>
    </section>

    {/* Game mode preview */}
    <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <h2 className="text-xl font-semibold text-white">Game Modes</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gameModes.map(({ name, description }) => (
          <div
            key={name}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700"
          >
            <h3 className="font-medium text-white">{name}</h3>
            <p className="mt-1 text-sm text-zinc-400">{description}</p>
          </div>
        ))}
      </div>
    </section>
  </>
)

export default Home
