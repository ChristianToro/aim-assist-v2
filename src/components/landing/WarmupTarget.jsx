import { useWarmupTarget } from '../../hooks/useWarmupTarget'

const formatMs = (ms) => (ms === null ? '—' : `${ms} ms`)

// The panel is a piece of the product's own UI (data-ui), open like a
// dialog, so it keeps a dialog's frame and drop.
const PANEL_FRAME = 'border border-edge shadow-2xl' // taste-skill-ignore

const Readout = ({ label, value }) => (
  <div>
    <dt className="text-caption text-muted">{label}</dt>
    <dd className="text-lead text-heading tabular-nums">{value}</dd>
  </div>
)

/*
 * The page's one live thing: a warm-up target drawn in the active theme's
 * own ring colours. Hitting it (pointer or keyboard) reports the reaction
 * time and moves it. Plain DOM: no canvas, nothing animates per frame.
 * The `action` slot holds the panel's primary button.
 */
const WarmupTarget = ({ action }) => {
  const { position, lastMs, bestMs, hit } = useWarmupTarget()

  return (
    <div
      data-ui
      className={`w-full max-w-[27.5rem] bg-bg p-5 text-body ${PANEL_FRAME}`}
    >
      <p className="font-medium text-heading">Warm-up</p>

      <div className="relative mt-4 aspect-[4/3] bg-surface">
        <button
          type="button"
          onClick={hit}
          aria-label="Hit the target"
          style={{ left: `${position.x}%`, top: `${position.y}%` }}
          className="absolute size-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-target-outer p-2.5 transition-transform duration-150 active:scale-90"
        >
          <span className="block size-full rounded-full bg-target-mid p-2">
            <span className="block size-full rounded-full bg-target-inner" />
          </span>
        </button>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-4" aria-live="polite">
        <Readout label="Last reaction" value={formatMs(lastMs)} />
        <Readout label="Best" value={formatMs(bestMs)} />
      </dl>

      <div className="mt-5 [&>*]:w-full">{action}</div>
    </div>
  )
}

export default WarmupTarget
