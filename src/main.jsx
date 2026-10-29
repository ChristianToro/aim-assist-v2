import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted faces: only the weights and subsets in use (PLAN-UI.md, U2).
// Unbounded sets our own uppercase copy, so Latin is enough; Onest also
// carries players' names, so it keeps Latin Extended.
import '@fontsource/unbounded/latin-800.css'
import '@fontsource/onest/latin-400.css'
import '@fontsource/onest/latin-500.css'
import '@fontsource/onest/latin-ext-400.css'
import '@fontsource/onest/latin-ext-500.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
