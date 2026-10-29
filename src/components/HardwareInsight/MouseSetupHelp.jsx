import Tooltip from '../Tooltip/Tooltip'

// Spans, not <p>s or a list: the tooltip is phrasing content, and a screen
// reader hears it flattened as the trigger's description anyway.
const Step = ({ number, title, children }) => (
  <span className="block">
    <span className="block font-medium">
      {number}. {title}
    </span>
    <span className="mt-0.5 block text-body">{children}</span>
  </span>
)

const STEPS = (
  <span className="block space-y-3">
    <Step number={1} title="Check your mouse’s software">
      If you have a gaming mouse, its companion app shows both settings. Common
      ones include Logitech G HUB, Razer Synapse, SteelSeries GG, Corsair iCUE,
      and Glorious Core. Open the app, select your mouse, and look for “DPI”
      (sometimes “CPI” or “sensitivity”) and “Polling Rate” (or “Report Rate”).
    </Step>
    <Step number={2} title="Look up your mouse model">
      Find your mouse’s model name on the bottom of the mouse or on the box,
      then search it online. The manufacturer’s spec page lists the default DPI
      and polling rate. If you’ve never changed these settings, the defaults are
      likely what you’re using.
    </Step>
  </span>
)

// Where to find the DPI and polling rate the hardware fields ask for.
const MouseSetupHelp = () => (
  <Tooltip content={STEPS} align="start" size="lg">
    {(triggerProps) => (
      <button
        type="button"
        className="text-meta text-muted underline decoration-dotted underline-offset-4 hover:text-heading focus-visible:outline-2 focus-visible:outline-accent"
        {...triggerProps}
      >
        Not sure what your DPI and polling rate are?
      </button>
    )}
  </Tooltip>
)

export default MouseSetupHelp
