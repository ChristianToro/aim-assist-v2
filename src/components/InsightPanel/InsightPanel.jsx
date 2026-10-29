import Button from '../Button/Button'
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner'
import { insightErrorMessage } from '../../utils/insightErrors'

const formatGenerated = ({ generatedAt, cached }) => {
  const when = new Date(generatedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  // A cached answer means nothing it was based on has changed since.
  return cached
    ? `Generated ${when}. Play more matches for an updated recommendation.`
    : `Generated ${when}.`
}

/*
 * The shared frame for an AI recommendation: a heading, optional inputs,
 * the answer (which `children` renders), any error, and a footer with the
 * Generate button and its status (a fresh answer takes Claude 10–20 s).
 * The footer sits at the panel's foot, so panels side by side end level.
 */
const InsightPanel = ({
  title,
  description,
  controls,
  insight,
  error,
  isLoading,
  onGenerate,
  children,
}) => (
  <div className="flex flex-col bg-surface">
    <div className="p-4">
      <h3 className="text-label font-medium text-heading">{title}</h3>
      <p className="mt-1 text-ui text-muted">{description}</p>
      {controls && <div className="mt-4">{controls}</div>}
    </div>

    {insight && (
      <div className="border-t border-edge p-4">
        {children(insight.recommendation)}
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
        {insight ? 'Update' : 'Get recommendation'}
      </Button>
      {isLoading ? (
        <span className="flex items-center gap-2 text-meta text-muted">
          <LoadingSpinner className="size-4" />
          Asking Claude. This can take 15 seconds.
        </span>
      ) : (
        insight && (
          <p className="text-meta text-muted">{formatGenerated(insight)}</p>
        )
      )}
    </div>
  </div>
)

export default InsightPanel
