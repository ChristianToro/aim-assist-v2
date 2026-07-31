/*
 * ThemePicker — a radio group of live theme previews.
 *
 * Each option's preview is wrapped in its own `data-theme`, so the tokens
 * in styles/themes.css cascade into that subtree and the swatch renders in
 * real theme colors rather than a hand-maintained list of hexes.
 *
 * Native radio inputs (visually hidden, styled through the label) keep
 * arrow-key navigation and group semantics for free.
 */

// Miniature of the app: nav bar above, a target on the play surface.
const ThemePreview = ({ themeId }) => (
  <div
    data-theme={themeId}
    aria-hidden="true"
    className="overflow-hidden rounded-lg border border-edge bg-bg"
  >
    <div className="flex items-center gap-1.5 border-b border-edge bg-surface px-2 py-1.5">
      <span className="text-[10px] leading-none text-accent">◎</span>
      <span className="h-1 w-6 rounded-full bg-muted" />
      <span className="ml-auto h-2.5 w-5 rounded-sm bg-accent-strong" />
    </div>
    <div className="flex h-16 items-center justify-center">
      {/* Ring sizes mirror the in-game scales: 1 / 0.66 / 0.33 */}
      <div className="flex size-10 items-center justify-center rounded-full bg-target-outer">
        <div className="flex size-[26px] items-center justify-center rounded-full bg-target-mid">
          <div className="size-[13px] rounded-full bg-target-inner" />
        </div>
      </div>
    </div>
  </div>
)

const ThemePicker = ({ themes, value, onChange }) => (
  <fieldset>
    <legend className="sr-only">Theme</legend>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {themes.map((theme) => {
        const isActive = theme.id === value
        return (
          <label
            key={theme.id}
            // The focus ring has to be CSS: the radio driving it is
            // visually hidden, so the label stands in for it.
            className={`cursor-pointer rounded-xl border bg-surface/50 p-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
              isActive
                ? 'border-accent'
                : 'border-edge hover:border-edge-strong'
            }`}
          >
            <input
              type="radio"
              name="theme"
              value={theme.id}
              checked={isActive}
              onChange={() => onChange(theme.id)}
              className="sr-only"
            />

            <ThemePreview themeId={theme.id} />

            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="font-medium text-heading">{theme.label}</span>
              {isActive && <span className="text-xs text-accent">Active</span>}
            </div>
            <p className="mt-1 text-sm text-muted">{theme.description}</p>
          </label>
        )
      })}
    </div>
  </fieldset>
)

export default ThemePicker
