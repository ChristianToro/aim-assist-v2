import { useState } from 'react'
import InsightPanel from '../InsightPanel/InsightPanel'
import { useInsight } from '../../hooks/useInsight'
import { getHardwareInsight } from '../../services/insights'
import {
  MAX_DPI,
  MIN_DPI,
  POLLING_RATES_HZ,
  toSetup,
} from '../../utils/mouseSetup'

const FIELD_CLASS =
  'mt-1 w-full rounded-lg border border-edge-strong bg-surface/50 px-3 py-1.5 text-sm text-heading focus-visible:outline-2 focus-visible:outline-accent'

const Recommendation = ({ label, value, rationale }) => (
  <div>
    <dt className="text-xs tracking-wide text-muted uppercase">{label}</dt>
    <dd className="mt-0.5 font-medium text-heading">{value}</dd>
    <dd className="mt-1 text-sm text-muted">{rationale}</dd>
  </div>
)

const HardwareAdvice = ({ summary, dpi, sensitivity, pollingRateHz }) => (
  <>
    <p className="text-sm text-body">{summary}</p>
    <dl className="mt-4 space-y-4">
      <Recommendation
        label="DPI"
        value={dpi.recommended}
        rationale={dpi.rationale}
      />
      <Recommendation
        label="Sensitivity"
        value={sensitivity.recommendation}
        rationale={sensitivity.rationale}
      />
      <Recommendation
        label="Polling rate"
        value={`${pollingRateHz.recommended} Hz`}
        rationale={pollingRateHz.rationale}
      />
    </dl>
  </>
)

// Mouse settings advice, with the player's current setup as optional input.
const HardwareInsight = () => {
  const [fields, setFields] = useState({ dpi: '', pollingRateHz: '' })
  const [isInvalid, setIsInvalid] = useState(false)
  const { insight, error, isLoading, generate } = useInsight(getHardwareInsight)

  const setField = (name) => (event) =>
    setFields((current) => ({ ...current, [name]: event.target.value }))

  const handleGenerate = () => {
    const { setup, invalid } = toSetup(fields)
    setIsInvalid(Boolean(invalid))
    if (!invalid) generate(setup)
  }

  const controls = (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <label className="text-muted">
        Current DPI
        <input
          type="number"
          inputMode="numeric"
          min={MIN_DPI}
          max={MAX_DPI}
          placeholder="Optional"
          value={fields.dpi}
          onChange={setField('dpi')}
          aria-invalid={isInvalid}
          className={FIELD_CLASS}
        />
      </label>
      <label className="text-muted">
        Polling rate
        <select
          value={fields.pollingRateHz}
          onChange={setField('pollingRateHz')}
          className={FIELD_CLASS}
        >
          <option value="">Not sure</option>
          {POLLING_RATES_HZ.map((rate) => (
            <option key={rate} value={rate}>
              {rate} Hz
            </option>
          ))}
        </select>
      </label>
      {isInvalid && (
        <p role="alert" className="col-span-2 text-accent">
          DPI must be a whole number from {MIN_DPI} to{' '}
          {MAX_DPI.toLocaleString()}.
        </p>
      )}
    </div>
  )

  return (
    <InsightPanel
      title="Mouse settings"
      description="DPI, sensitivity and polling rate suggestions based on your stats in each mode."
      controls={controls}
      insight={insight}
      error={error}
      isLoading={isLoading}
      onGenerate={handleGenerate}
    >
      {(advice) => <HardwareAdvice {...advice} />}
    </InsightPanel>
  )
}

export default HardwareInsight
