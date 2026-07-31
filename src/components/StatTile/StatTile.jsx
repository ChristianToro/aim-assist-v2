// Small labeled stat, used by the in-game HUD and the profile dashboard.
const StatTile = ({ label, value, accent = false }) => (
  <div className="rounded-lg border border-edge bg-surface/50 px-4 py-2 text-center">
    <p className="text-xs tracking-wide text-muted uppercase">{label}</p>
    <p
      className={`text-lg font-semibold tabular-nums ${
        accent ? 'text-accent' : 'text-heading'
      }`}
    >
      {value}
    </p>
  </div>
)

export default StatTile
