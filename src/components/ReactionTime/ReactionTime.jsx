import { formatReactionMs } from '../../utils/leaderboardFormat'

// A reaction time with its unit as a grey suffix ("1,493 ms"), or a grey
// dash when none was recorded (a match with no hits).
const ReactionTime = ({ ms }) => {
  const value = formatReactionMs(ms)
  if (value === null) return <span className="text-muted">—</span>
  return (
    <>
      {value}
      <span className="text-muted"> ms</span>
    </>
  )
}

export default ReactionTime
