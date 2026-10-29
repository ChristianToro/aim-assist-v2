import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../contexts/authContext'

export const SIGNED_IN_USER = {
  uid: 'u1',
  displayName: 'Ada',
  photoURL: null,
}

// Renders `ui` with a fixed auth state and a router at `route`, so
// components that read useAuth() or render links need no real session.
export const renderWithAuth = (
  ui,
  { user = null, isLoading = false, route = '/' } = {}
) =>
  render(
    <AuthContext.Provider value={{ user, isLoading }}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </AuthContext.Provider>
  )
