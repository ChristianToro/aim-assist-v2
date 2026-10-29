import Modal from '../Modal/Modal'
import Button from '../Button/Button'
import ReactionTime from '../ReactionTime/ReactionTime'
import { formatAccuracy, formatScore } from '../../utils/leaderboardFormat'

const SAVE_STATUS_TEXT = {
  'signed-out': 'Sign in to save scores and rank on the leaderboards.',
  saving: 'Saving score…',
  saved: 'Saved to your profile.',
  error: "Couldn't save this score. Check your connection.",
  unregistered:
    "This match couldn't be registered when it started, so its score wasn't saved.",
  rejected: "The server couldn't verify this match, so its score wasn't saved.",
}

const Row = ({ label, children }) => (
  <div className="flex items-center justify-between border-t border-edge py-2 text-ui">
    <dt className="text-muted">{label}</dt>
    <dd className="font-medium text-heading tabular-nums">{children}</dd>
  </div>
)

// End-of-match statistics. Rendered when the session reports game over.
const ResultsModal = ({
  open,
  summary,
  saveStatus,
  title = "Time's up!",
  onRestart,
  onClose,
}) => {
  if (!summary) return null

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p>
        <span className="block text-meta text-muted">Final score</span>
        <span className="text-answer font-medium text-heading tabular-nums">
          {formatScore(summary.score)}
        </span>
      </p>

      <dl className="mt-4">
        <Row label="Accuracy">{formatAccuracy(summary.accuracy)}</Row>
        <Row label="Hits / misses">
          {summary.hits} / {summary.misses}
        </Row>
        <Row label="Max combo">{summary.maxCombo}×</Row>
        <Row label="Average reaction">
          <ReactionTime ms={summary.averageReactionMs} />
        </Row>
        <Row label="Best reaction">
          <ReactionTime ms={summary.bestReactionMs} />
        </Row>
        <Row label="Worst reaction">
          <ReactionTime ms={summary.worstReactionMs} />
        </Row>
      </dl>

      {saveStatus && (
        <p className="mt-4 text-meta text-muted" role="status">
          {SAVE_STATUS_TEXT[saveStatus]}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
        <Button variant="solid" size="sm" onClick={onRestart}>
          Play again
        </Button>
      </div>
    </Modal>
  )
}

export default ResultsModal
