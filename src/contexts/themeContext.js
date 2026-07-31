import { createContext } from 'react'
import { DEFAULT_THEME_ID, THEMES } from '../styles/themes'

// Consumed via the useTheme() hook; provided by ThemeProvider.
// The default value keeps consumers (including the game hook) working
// outside a provider, which unit tests rely on.
export const ThemeContext = createContext({
  themeId: DEFAULT_THEME_ID,
  themes: THEMES,
  setTheme: () => {},
})
