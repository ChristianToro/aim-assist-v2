/*
 * Headline figures as one strip: a single container split by 1px lines
 * into equal cells, each label over its value (no tile per figure).
 * The lines are the container's own colour showing through a 1px gap.
 *
 * A null value is a grey dash, read out as "none yet"; while loading,
 * each value is a flat bar at its real size.
 */
const Value = ({ value, isLoading }) => {
  if (isLoading) {
    return <span aria-hidden="true" className="my-1 block h-5 w-16 bg-edge" />
  }
  if (value === null) {
    return (
      <>
        <span aria-hidden="true" className="text-muted">
          —
        </span>
        <span className="sr-only">None yet</span>
      </>
    )
  }
  return value
}

const StatStrip = ({ items, isLoading = false }) => (
  <dl className="grid grid-cols-2 gap-px bg-edge sm:grid-cols-4">
    {items.map(({ label, value }) => (
      <div key={label} className="bg-surface px-4 py-3">
        <dt className="text-meta text-muted">{label}</dt>
        <dd className="mt-1 text-figure font-medium text-heading tabular-nums">
          <Value value={value} isLoading={isLoading} />
        </dd>
      </div>
    ))}
  </dl>
)

export default StatStrip
