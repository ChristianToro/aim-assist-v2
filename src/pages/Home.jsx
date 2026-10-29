import Button from '../components/Button/Button'
import Card from '../components/Card/Card'
import Tooltip from '../components/Tooltip/Tooltip'
import { GAME_MODES } from '../game/modes'
import { useAuth } from '../hooks/useAuth'

// /play needs a signed-in player, so signed out the button explains how
// to get one instead of leading to a redirect.
const StartTrainingButton = () => {
  const { user } = useAuth()

  if (user) return <Button to="/play">Start Training</Button>

  return (
    <Tooltip content="Continue with Google to start playing">
      {(triggerProps) => <Button {...triggerProps}>Start Training</Button>}
    </Tooltip>
  )
}

const Home = () => (
  <>
    {/* Hero */}
    <section className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
      <h1 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight text-heading sm:text-5xl">
        Train your aim, <span className="text-accent">track your progress</span>
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
        A browser-based aim trainer with six game modes, live statistics, and
        global leaderboards. No install required.
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <StartTrainingButton />
        <Button to="/leaderboards" variant="secondary">
          Leaderboards
        </Button>
      </div>
    </section>

    {/* Game mode preview */}
    <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <h2 className="text-xl font-semibold text-heading">Game Modes</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAME_MODES.map(({ id, label, description }) => (
          <Card key={id} className="transition-colors hover:border-edge-strong">
            <h3 className="font-medium text-heading">{label}</h3>
            <p className="mt-1 text-sm text-muted">{description}</p>
          </Card>
        ))}
      </div>
    </section>
  </>
)

export default Home
