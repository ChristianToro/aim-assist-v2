import { useState } from 'react'
import InsightPanel from '../InsightPanel/InsightPanel'
import { useInsight } from '../../hooks/useInsight'
import { useInsightHistory } from '../../hooks/useInsightHistory'
import {
  getHardwareInsight,
  listHardwareInsights,
} from '../../services/insights'
import { FIELD } from '../../styles/field'
import {
  MAX_DPI,
  MIN_DPI,
  POLLING_RATES_HZ,
  describeSetup,
  toSetup,
} from '../../utils/mouseSetup'

// Label above a square 36px control (one control height per panel).
const LABEL_CLASS = 'text-ui font-medium text-body'
const FIELD_CLASS = `mt-2 block w-full ${FIELD}`

const Recommendation = ({ label, value, rationale }) => (
  <div>
    <dt className="text-meta text-muted">{label}</dt>
    <dd className="mt-0.5 text-ui font-medium text-heading">{value}</dd>
    <dd className="mt-1 text-ui text-muted">{rationale}</dd>
  </div>
)

// `setup` is the mouse the answer was for, if it was recorded.
const HardwareAdvice = ({
  setup,
  summary,
  dpi,
  sensitivity,
  pollingRateHz,
}) => {
  const setupLine = describeSetup(setup)
  return (
    <>
      {setupLine && <p className="mb-2 text-meta text-muted">{setupLine}</p>}
      <p className="text-ui text-body">{summary}</p>
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
}

// Mouse settings advice, with the player's current setup as optional input.
const HardwareInsight = ({ uid }) => {
  const [fields, setFields] = useState({ dpi: '', pollingRateHz: '' })
  const [isInvalid, setIsInvalid] = useState(false)
  const history = useInsightHistory(listHardwareInsights, uid)
  const { error, isLoading, generate } = useInsight(
    getHardwareInsight,
    history.add
  )

  const setField = (name) => (event) =>
    setFields((current) => ({ ...current, [name]: event.target.value }))

  const handleGenerate = () => {
    const { setup, invalid } = toSetup(fields)
    setIsInvalid(Boolean(invalid))
    if (!invalid) generate(setup)
  }

  const controls = (
    <div className="grid grid-cols-2 gap-4">
      <label className={LABEL_CLASS}>
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
      <label className={LABEL_CLASS}>
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
        <p role="alert" className="col-span-2 text-ui text-body">
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
      history={history}
      error={error}
      isLoading={isLoading}
      onGenerate={handleGenerate}
    >
      {({ recommendation, context }) => (
        <HardwareAdvice {...recommendation} setup={context?.setup} />
      )}
    </InsightPanel>
  )
}

export default HardwareInsight
