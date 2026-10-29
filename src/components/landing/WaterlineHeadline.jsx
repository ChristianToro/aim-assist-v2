import { Fragment } from 'react'

/*
 * The "waterline" headline: two display lines, anchored so the middle of
 * the second sits exactly on its section's --seam-y. That line's
 * `.waterline` copy (a ::after in the on-accent ink, styles in index.css)
 * covers its lower half, so the letters change colour where the fields
 * meet. The space between the block lines keeps the accessible name
 * readable.
 */
const WaterlineHeadline = ({ lines }) => (
  <h1 className="absolute top-(--seam-y) -translate-y-3/4 font-display text-display text-accent">
    {lines.map((line, index) => (
      <Fragment key={line}>
        {index > 0 && ' '}
        <span className="mask-line">
          <span
            style={{ '--line': index }}
            className={index === 1 ? 'waterline' : undefined}
            data-text={line}
          >
            {line}
          </span>
        </span>
      </Fragment>
    ))}
  </h1>
)

export default WaterlineHeadline
