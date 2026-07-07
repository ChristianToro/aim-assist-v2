const chipClass = (isActive) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-surface text-heading'
      : 'text-muted hover:bg-surface hover:text-heading'
  }`

// Mode selection chips. Switching modes remounts the game area,
// abandoning any match in progress.
const ModePicker = ({ modes, selectedId, onSelect }) => (
  <div className="flex flex-wrap gap-1" role="tablist" aria-label="Game mode">
    {modes.map(({ id, label }) => (
      <button
        key={id}
        type="button"
        role="tab"
        aria-selected={selectedId === id}
        className={chipClass(selectedId === id)}
        onClick={() => onSelect(id)}
      >
        {label}
      </button>
    ))}
  </div>
)

export default ModePicker
