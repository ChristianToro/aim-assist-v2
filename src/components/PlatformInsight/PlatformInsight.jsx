import InsightPanel from '../InsightPanel/InsightPanel'
import { useInsight } from '../../hooks/useInsight'
import { useInsightHistory } from '../../hooks/useInsightHistory'
import {
  getPlatformInsight,
  listPlatformInsights,
} from '../../services/insights'

const Pick = ({ title, genre, platforms, fit }) => (
  <li>
    <p className="text-ui font-medium text-heading">{title}</p>
    <p className="text-meta text-muted">
      {genre} · {platforms.join(', ')}
    </p>
    <p className="mt-1 text-ui text-muted">{fit}</p>
  </li>
)

const PlatformAdvice = ({ summary, picks, avoidForNow }) => (
  <>
    <p className="text-ui text-body">{summary}</p>
    <ul className="mt-4 space-y-4">
      {picks.map((pick) => (
        <Pick key={pick.title} {...pick} />
      ))}
    </ul>
    <p className="mt-4 text-ui text-body">
      <span className="font-medium text-heading">Hold off on: </span>
      {avoidForNow}
    </p>
  </>
)

// Shooter games, with their platforms, that suit the player's aim profile.
const PlatformInsight = ({ uid }) => {
  const history = useInsightHistory(listPlatformInsights, uid)
  const { error, isLoading, generate } = useInsight(
    getPlatformInsight,
    history.add
  )

  return (
    <InsightPanel
      title="Games for your aim"
      description="Shooters, and the platforms they're on, that match the strengths your stats show."
      history={history}
      error={error}
      isLoading={isLoading}
      onGenerate={() => generate()}
    >
      {({ recommendation }) => <PlatformAdvice {...recommendation} />}
    </InsightPanel>
  )
}

export default PlatformInsight
