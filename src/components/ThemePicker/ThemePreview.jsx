/*
 * A miniature of the app in one theme: the nav bar above, a target on the
 * play surface. Wrapped in its own `data-theme`, so the tokens in
 * styles/themes.css cascade into it and it renders in the theme's real
 * colours rather than a hand-maintained list of hexes.
 *
 * `data-ui` marks it as an interface fragment, so the taste-skill checks
 * allow its inner borders.
 */

// Ring sizes mirror the in-game scales: 1 / 0.66 / 0.33.
const SIZES = {
  sm: {
    stage: 'h-12',
    outer: 'size-8',
    mid: 'size-[21px]',
    inner: 'size-[11px]',
  },
  lg: { stage: 'h-36', outer: 'size-24', mid: 'size-[63px]', inner: 'size-8' },
}

const ThemePreview = ({ themeId, size = 'sm' }) => {
  const s = SIZES[size]

  return (
    <div
      data-theme={themeId}
      data-ui
      aria-hidden="true"
      className="overflow-hidden border border-edge bg-bg"
    >
      <div className="flex items-center gap-1.5 border-b border-edge bg-surface px-2 py-1.5">
        <span className="text-[10px] leading-none text-accent">◎</span>
        <span className="h-1 w-6 bg-muted" />
        <span className="ml-auto h-2.5 w-5 bg-accent-strong" />
      </div>
      <div className={`flex items-center justify-center ${s.stage}`}>
        <div
          className={`flex items-center justify-center rounded-full bg-target-outer ${s.outer}`}
        >
          <div
            className={`flex items-center justify-center rounded-full bg-target-mid ${s.mid}`}
          >
            <div className={`rounded-full bg-target-inner ${s.inner}`} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThemePreview
