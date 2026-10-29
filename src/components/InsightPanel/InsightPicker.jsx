import { useId } from 'react'
import { FIELD } from '../../styles/field'
import { formatGeneratedAt } from '../../utils/insightHistory'

const optionLabel = (entry, index) =>
  index === 0
    ? `Latest, ${formatGeneratedAt(entry.generatedAt)}`
    : formatGeneratedAt(entry.generatedAt)

// Which of the player's saved answers the panel shows, newest first.
const InsightPicker = ({ entries, shownId, onSelect }) => {
  const id = useId()
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <label htmlFor={id} className="text-meta text-muted">
        Showing
      </label>
      <select
        id={id}
        value={shownId}
        onChange={(event) => onSelect(event.target.value)}
        className={`${FIELD} min-w-0 max-w-full`}
      >
        {entries.map((entry, index) => (
          <option key={entry.id} value={entry.id}>
            {optionLabel(entry, index)}
          </option>
        ))}
      </select>
    </div>
  )
}

export default InsightPicker
