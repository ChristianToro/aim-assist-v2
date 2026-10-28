import InsightPanel from '../InsightPanel/InsightPanel'
import { useInsight } from '../../hooks/useInsight'
import { getPlatformInsight } from '../../services/insights'

const Pick = ({ title, genre, platforms, fit }) => (
  <li>
    <p className="font-medium text-heading">{title}</p>
    <p className="text-xs text-muted">
      {genre} · {platforms.join(', ')}
    </p>
    <p className="mt-1 text-sm text-muted">{fit}</p>
  </li>
)

const PlatformAdvice = ({ summary, picks, avoidForNow }) => (
  <>
    <p className="text-sm text-body">{summary}</p>
    <ul className="mt-4 space-y-4">
      {picks.map((pick) => (
        <Pick key={pick.title} {...pick} />
      ))}
    </ul>
    <p className="mt-4 text-sm text-body">
      <span className="font-medium text-heading">Hold off on: </span>
      {avoidForNow}
    </p>
  </>
)

// Shooter games, with their platforms, that suit the player's aim profile.
const PlatformInsight = () => {
  const { insight, error, isLoading, generate } = useInsight(getPlatformInsight)

  return (
    <InsightPanel
      title="Games for your aim"
      description="Shooters, and the platforms they're on, that match the strengths your stats show."
      insight={insight}
      error={error}
      isLoading={isLoading}
      onGenerate={() => generate()}
    >
      {(advice) => <PlatformAdvice {...advice} />}
    </InsightPanel>
  )
}

export default PlatformInsight
