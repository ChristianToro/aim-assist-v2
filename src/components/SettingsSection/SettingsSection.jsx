import { useId } from 'react'

/*
 * One settings area: a label column (its title, what it controls, and an
 * optional summary of the current value) beside its panel. Stacked on
 * phones and tablets. Areas are split by a full-width rule.
 *
 * Desktop grid: 352 label + 48 gap + 704 panel = 1104, the max-w-6xl
 * content width.
 */
const SettingsSection = ({ title, description, summary, children }) => {
  const headingId = useId()

  return (
    <section
      aria-labelledby={headingId}
      className="grid gap-4 border-t border-edge py-8 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-12"
    >
      {/* pt-4 sets the title level with the panel's first line */}
      <div className="lg:pt-4">
        <h2 id={headingId} className="text-label font-medium text-heading">
          {title}
        </h2>
        <p className="mt-1 text-ui text-muted">{description}</p>
        {summary && <div className="mt-6 hidden lg:block">{summary}</div>}
      </div>
      <div className="bg-surface p-4">{children}</div>
    </section>
  )
}

export default SettingsSection
