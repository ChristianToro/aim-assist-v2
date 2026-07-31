import { useEffect, useState } from 'react'
import { ThemeContext } from './themeContext'
import { DEFAULT_THEME_ID, THEMES, isValidThemeId } from '../styles/themes'

// Keep in sync with the pre-paint script in index.html, which applies the
// saved theme before React mounts so there is no flash of the default.
const STORAGE_KEY = 'aim-assist:theme'

const readStoredTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (isValidThemeId(stored)) return stored
  } catch {
    // Storage unavailable (private mode) — fall through to the default.
  }
  return DEFAULT_THEME_ID
}

// A single attribute on <html> drives every token in styles/themes.css.
const applyTheme = (themeId) => {
  document.documentElement.dataset.theme = themeId
}

/*
 * ThemeProvider — owns the active theme and persists it to localStorage.
 *
 * The theme is React state, but the DOM attribute is the real channel:
 * CSS reads it for the UI, and the canvas palette resolves the same
 * variables from it. That is why setTheme() stamps the attribute
 * synchronously rather than waiting for an effect — child effects run
 * before parent effects, so a deferred write would let consumers read
 * the previous theme's variables for one commit.
 */
const ThemeProvider = ({ children }) => {
  const [themeId, setThemeId] = useState(readStoredTheme)

  // Covers the initial mount (and any path where the pre-paint script
  // didn't run); applyTheme is idempotent so the overlap is harmless.
  useEffect(() => {
    applyTheme(themeId)
  }, [themeId])

  const setTheme = (nextId) => {
    if (!isValidThemeId(nextId)) return
    applyTheme(nextId)
    try {
      localStorage.setItem(STORAGE_KEY, nextId)
    } catch {
      // Preference just won't persist across sessions.
    }
    setThemeId(nextId)
  }

  return (
    <ThemeContext.Provider value={{ themeId, themes: THEMES, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeProvider
