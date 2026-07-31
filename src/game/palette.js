/*
 * Canvas palette — the bridge from CSS theme tokens to the game engine.
 *
 * Themes define their canvas colors alongside their UI colors (see
 * styles/themes.css), so this reads the resolved custom properties once
 * per theme change rather than duplicating five palettes in JavaScript.
 *
 * Read once, never per frame: getComputedStyle forces a style recalc, and
 * doing that inside draw() would put a layout read in the hot path.
 */

const TOKENS = {
  targetOuter: '--target-outer',
  targetMid: '--target-mid',
  targetInner: '--target-inner',
  burst1: '--burst-1',
  burst2: '--burst-2',
  burst3: '--burst-3',
  floatText: '--float-text',
}

// The dark theme's values, used when no DOM is available (unit tests) or a
// token is missing. Keeps every draw() callable without a palette argument.
export const FALLBACK_PALETTE = {
  targetOuter: '#164e63',
  targetMid: '#0e7490',
  targetInner: '#22d3ee',
  burst: ['#22d3ee', '#0e7490', '#e4e4e7'],
  floatText: '#e4e4e7',
}

export const readCanvasPalette = () => {
  if (typeof document === 'undefined') return FALLBACK_PALETTE

  const styles = getComputedStyle(document.documentElement)
  // Custom properties resolve to '' when unset; fall back token by token
  // so a partially defined theme still renders.
  const read = (key) => styles.getPropertyValue(TOKENS[key]).trim() || undefined

  return {
    targetOuter: read('targetOuter') ?? FALLBACK_PALETTE.targetOuter,
    targetMid: read('targetMid') ?? FALLBACK_PALETTE.targetMid,
    targetInner: read('targetInner') ?? FALLBACK_PALETTE.targetInner,
    burst: [
      read('burst1') ?? FALLBACK_PALETTE.burst[0],
      read('burst2') ?? FALLBACK_PALETTE.burst[1],
      read('burst3') ?? FALLBACK_PALETTE.burst[2],
    ],
    floatText: read('floatText') ?? FALLBACK_PALETTE.floatText,
  }
}
