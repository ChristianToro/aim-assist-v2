// Surface container used for stats, leaderboard tables, panels, etc. It's
// set apart from the page by one tone step, not an outline.
const Card = ({ className = '', ...props }) => (
  <div className={`bg-surface p-5 ${className}`} {...props} />
)

export default Card
