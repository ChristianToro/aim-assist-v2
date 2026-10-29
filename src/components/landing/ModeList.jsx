import { GAME_MODES } from '../../game/modes'
import { modeFacts } from '../../utils/modeFacts'

/*
 * The six modes at poster scale: one name per row, its description in the
 * right-hand columns on the same baseline. The heading is the list's first
 * row, set like the names but in the soft ink.
 */
const ModeList = () => (
  <section
    aria-labelledby="modes-heading"
    className="mx-auto max-w-6xl px-4 py-[clamp(7.5rem,18vh,12rem)] sm:px-6"
  >
    <h2
      id="modes-heading"
      data-reveal
      className="font-display text-head text-muted"
    >
      Six ways to train
    </h2>
    <ul className="mode-list mt-[0.35em] text-head">
      {GAME_MODES.map(({ id, label, description, ...mode }, index) => (
        <li
          key={id}
          data-reveal
          style={{ '--stagger': index + 1 }}
          className="mode-row grid gap-x-6 gap-y-2 py-[0.35em] lg:grid-cols-12 lg:items-baseline"
        >
          <h3 className="mode-name font-display text-heading transition-colors duration-200 lg:col-span-8">
            {label}
          </h3>
          <p className="max-w-[36rem] pl-4 text-copy text-body lg:col-span-4 lg:pl-0">
            {description} <span className="text-muted">{modeFacts(mode)}</span>
          </p>
        </li>
      ))}
    </ul>
  </section>
)

export default ModeList
