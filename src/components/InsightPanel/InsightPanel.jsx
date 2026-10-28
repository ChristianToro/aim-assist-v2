import Button from '../Button/Button'
import Card from '../Card/Card'
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
 * a Generate button with a loading state (a fresh answer takes Claude
 * 10–20 s), the error message, and the answer, which `children` renders.
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
  <Card className="flex flex-col gap-4">
    <div>
      <h3 className="font-medium text-heading">{title}</h3>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </div>

    {controls}

    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm" onClick={onGenerate} disabled={isLoading}>
        {insight ? 'Update' : 'Get recommendation'}
      </Button>
      {isLoading && (
        <span className="flex items-center gap-2 text-sm text-muted">
          <LoadingSpinner className="h-4 w-4" />
          Asking Claude. This can take 15 seconds.
        </span>
      )}
    </div>

    {error && (
      <p role="alert" className="text-sm text-accent">
        {insightErrorMessage(error)}
      </p>
    )}

    {insight && (
      <div className="border-t border-edge pt-4">
        {children(insight.recommendation)}
        <p className="mt-4 text-xs text-muted">{formatGenerated(insight)}</p>
      </div>
    )}
  </Card>
)

export default InsightPanel
