import Modal from '../Modal/Modal'
import Button from '../Button/Button'

const formatMs = (ms) => (ms === null ? '—' : `${ms} ms`)

const SAVE_STATUS_TEXT = {
  'signed-out': 'Sign in to save scores and rank on the leaderboards.',
  saving: 'Saving score…',
  saved: 'Saved to your profile.',
  error: "Couldn't save this score — check your connection.",
}

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between border-b border-edge py-2 text-sm last:border-b-0">
    <span className="text-muted">{label}</span>
    <span className="font-medium text-heading tabular-nums">{value}</span>
  </div>
)

// End-of-match statistics. Rendered when the session reports game over.
const ResultsModal = ({ open, summary, saveStatus, onRestart, onClose }) => {
  if (!summary) return null

  return (
    <Modal open={open} onClose={onClose} title="Time's up!">
      <p className="text-center">
        <span className="text-5xl font-semibold text-accent tabular-nums">
          {summary.score}
        </span>
        <span className="mt-1 block text-sm text-muted">Final Score</span>
      </p>

      <div className="mt-6">
        <Row label="Accuracy" value={`${summary.accuracy.toFixed(1)}%`} />
        <Row
          label="Hits / Misses"
          value={`${summary.hits} / ${summary.misses}`}
        />
        <Row label="Max Combo" value={`${summary.maxCombo}×`} />
        <Row label="Avg Reaction" value={formatMs(summary.averageReactionMs)} />
        <Row label="Best Reaction" value={formatMs(summary.bestReactionMs)} />
        <Row label="Worst Reaction" value={formatMs(summary.worstReactionMs)} />
      </div>

      {saveStatus && (
        <p className="mt-4 text-center text-xs text-muted" role="status">
          {SAVE_STATUS_TEXT[saveStatus]}
        </p>
      )}

      <div className="mt-6 flex justify-center gap-3">
        <Button onClick={onRestart}>Play Again</Button>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  )
}

export default ResultsModal
