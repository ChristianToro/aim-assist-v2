import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// RTL auto-cleanup registers via global afterEach, which we don't enable
// (globals: false keeps imports explicit) — so hook it up here.
afterEach(cleanup)
