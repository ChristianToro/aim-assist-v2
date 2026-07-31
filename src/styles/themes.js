/*
 * Theme registry — identity and copy only.
 *
 * Colors deliberately live in themes.css, not here: keeping CSS as the
 * single source of truth means `prefers-contrast: more` overrides still
 * compose on top of a theme, and nothing can drift between two lists.
 * Anything that needs the actual values reads the resolved custom
 * properties (see game/palette.js).
 */

export const THEMES = [
  {
    id: 'dark',
    label: 'Dark',
    description: 'The default. Neutral zinc surfaces with a cyan accent.',
  },
  {
    id: 'light',
    label: 'Light',
    description: 'Bright surfaces for well-lit rooms and daytime play.',
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    description: 'Violet black with hot pink accents and magenta targets.',
  },
  {
    id: 'terminal',
    label: 'Terminal',
    description: 'Pure black with a single phosphor green throughout.',
  },
  {
    id: 'aimlabs',
    label: 'Aimlabs',
    description: 'Navy slate and vivid blue, after the app that inspired this.',
  },
]

export const DEFAULT_THEME_ID = 'dark'

export const isValidThemeId = (id) => THEMES.some((theme) => theme.id === id)

export const getThemeById = (id) =>
  THEMES.find((theme) => theme.id === id) ??
  THEMES.find((theme) => theme.id === DEFAULT_THEME_ID)
