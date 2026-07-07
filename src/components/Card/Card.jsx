// Surface container used for stats, game mode tiles, leaderboard rows, etc.
const Card = ({ className = '', ...props }) => (
  <div
    className={`rounded-xl border border-edge bg-surface/50 p-5 ${className}`}
    {...props}
  />
)

export default Card
