import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

const { mockSignIn } = vi.hoisted(() => ({ mockSignIn: vi.fn() }))
vi.mock('../../services/auth', () => ({ signInWithGoogle: mockSignIn }))

import GoogleSignInButton from './GoogleSignInButton'

beforeEach(() => {
  mockSignIn.mockReset()
})

describe('GoogleSignInButton', () => {
  it('starts Google sign-in on click', () => {
    mockSignIn.mockResolvedValue()
    render(<GoogleSignInButton />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Continue with Google' })
    )

    expect(mockSignIn).toHaveBeenCalledOnce()
  })

  it('logs a failed sign-in instead of throwing', async () => {
    const error = new Error('popup closed')
    mockSignIn.mockRejectedValue(error)
    const logError = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<GoogleSignInButton>Sign in</GoogleSignInButton>)

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() =>
      expect(logError).toHaveBeenCalledWith('Sign-in failed:', error)
    )
    logError.mockRestore()
  })
})
