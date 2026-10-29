import { Fragment } from 'react'
import GoogleSignInButton from '../GoogleSignInButton/GoogleSignInButton'
import StartTrainingButton from './StartTrainingButton'
import WarmupTarget from './WarmupTarget'
import { useAuth } from '../../hooks/useAuth'

const CLOSING_LINES = ['Are you ready to', 'step your game up?']

/*
 * The close: an accent field with the closing line across the top, then
 * one sentence at the lower left and the warm-up panel already open at the
 * right. The panel's button is the page's last action: sign in, or
 * straight to /play for a signed-in player.
 */
const ClosingCall = () => {
  const { user } = useAuth()

  return (
    <section
      aria-labelledby="closing-heading"
      className="bg-accent-strong py-16 md:py-24"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-12 md:gap-x-6 md:gap-y-16">
        <h2
          id="closing-heading"
          data-reveal
          className="font-display text-head text-on-accent md:col-span-12"
        >
          {CLOSING_LINES.map((line, index) => (
            <Fragment key={line}>
              {index > 0 && ' '}
              <span className="block">{line}</span>
            </Fragment>
          ))}
        </h2>

        <p
          data-reveal
          style={{ '--stagger': 1 }}
          className="self-end text-lead text-on-accent md:col-span-6"
        >
          {user
            ? 'Your first round is one click away. Every score lands on your profile.'
            : 'Sign in with Google to start your first round. Every score lands on your profile.'}
        </p>

        <div
          data-reveal
          style={{ '--stagger': 2 }}
          className="flex md:col-span-5 md:col-start-8"
        >
          <WarmupTarget
            action={
              user ? (
                <StartTrainingButton size="lg" />
              ) : (
                <GoogleSignInButton size="lg" returnTo="/play" />
              )
            }
          />
        </div>
      </div>
    </section>
  )
}

export default ClosingCall
