import Button from '../Button/Button'
import InsightPicker from './InsightPicker'
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner'
import { insightErrorMessage } from '../../utils/insightErrors'
import { formatGeneratedAt } from '../../utils/insightHistory'

const formatGenerated = ({ generatedAt, cached }) => {
  const when = formatGeneratedAt(generatedAt)
  // A cached answer means nothing it was based on has changed since.
  return cached
    ? `Generated ${when}. Play more matches for an updated recommendation.`
    : `Generated ${when}.`
}

const BusyLine = ({ children }) => (
  <span className="flex items-center gap-2 text-meta text-muted">
    <LoadingSpinner className="size-4" />
    {children}
  </span>
)

// The past answers failed to load: generating still works, so it's one
// quiet line and a retry rather than a broken panel.
const HistoryError = ({ onRetry }) => (
  <p role="alert" className="border-t border-edge p-4 text-ui text-muted">
    Couldn&apos;t load your past recommendations.
    <button
      type="button"
      onClick={onRetry}
      className="ml-2 font-medium text-heading underline-offset-4 hover:underline"
    >
      Retry
    </button>
  </p>
)

/*
 * The shared frame for an AI recommendation: a heading, optional inputs,
 * the shown answer (which `children` renders from its entry), any error,
 * and a footer with the Generate button and its status (a fresh answer
 * takes Claude 10–20 s). `history` is useInsightHistory's result: the
 * panel opens on the latest saved answer, and a picker shows older ones.
 * The footer sits at the panel's foot, so panels side by side end level.
 */
const InsightPanel = ({
  title,
  description,
  controls,
  history,
  error,
  isLoading,
  onGenerate,
  children,
}) => {
  const { entries, shown } = history

  return (
    <div className="flex flex-col bg-surface">
      <div className="p-4">
        <h3 className="text-label font-medium text-heading">{title}</h3>
        <p className="mt-1 text-ui text-muted">{description}</p>
        {controls && <div className="mt-4">{controls}</div>}
      </div>

      {history.isLoading && !shown && (
        <div className="border-t border-edge p-4">
          <BusyLine>Loading your last recommendation.</BusyLine>
        </div>
      )}

      {history.error && <HistoryError onRetry={history.reload} />}

      {shown && (
        <div className="border-t border-edge p-4">
          {entries.length > 1 && (
            <div className="mb-4">
              <InsightPicker
                entries={entries}
                shownId={shown.id}
                onSelect={history.select}
              />
            </div>
          )}
          {children(shown)}
        </div>
      )}

      {error && (
        <p role="alert" className="border-t border-edge p-4 text-ui text-body">
          {insightErrorMessage(error)}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-edge p-4">
        <Button
          variant="inverse"
          size="sm"
          onClick={onGenerate}
          disabled={isLoading}
        >
          {shown ? 'Update' : 'Get recommendation'}
        </Button>
        {isLoading ? (
          <BusyLine>Asking Claude. This can take 15 seconds.</BusyLine>
        ) : (
          shown && (
            <p className="text-meta text-muted">{formatGenerated(shown)}</p>
          )
        )}
      </div>
    </div>
  )
}

export default InsightPanel
