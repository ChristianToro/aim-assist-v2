import ThemePreview from './ThemePreview'

/*
 * ThemePicker — a radio group of live theme previews, one row per theme.
 *
 * The chosen theme's name carries the app's one selection mark: a 1px
 * accent line exactly as wide as the label. Native radio inputs (visually
 * hidden, styled through the label) keep arrow-key navigation and group
 * semantics for free.
 */
const ThemePicker = ({ themes, value, onChange }) => (
  <fieldset>
    <legend className="sr-only">Theme</legend>
    <div className="divide-y divide-edge">
      {themes.map((theme) => {
        const isActive = theme.id === value
        return (
          <label
            key={theme.id}
            // The focus ring has to be CSS: the radio driving it is
            // visually hidden, so the label stands in for it.
            className="group flex cursor-pointer items-center gap-4 py-3 first:pt-0 last:pb-0 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent"
          >
            <input
              type="radio"
              name="theme"
              value={theme.id}
              checked={isActive}
              onChange={() => onChange(theme.id)}
              className="sr-only"
            />

            <div className="w-24 shrink-0 sm:w-28">
              <ThemePreview themeId={theme.id} />
            </div>

            <div className="min-w-0">
              <span
                className={`inline-block border-b pb-0.5 text-ui font-medium text-heading transition-colors ${
                  isActive
                    ? 'border-accent'
                    : 'border-transparent group-hover:border-edge-strong'
                }`}
              >
                {theme.label}
              </span>
              <p className="mt-1 text-ui text-muted">{theme.description}</p>
            </div>
          </label>
        )
      })}
    </div>
  </fieldset>
)

export default ThemePicker
