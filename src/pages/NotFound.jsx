import Button from '../components/Button/Button'
import WaterlineHeadline from '../components/landing/WaterlineHeadline'
import WarmupTarget from '../components/landing/WarmupTarget'

const HEADLINE_LINES = ['404', 'Missed']

/*
 * The 404 in the landing hero's composition: the same two fields and
 * waterline headline, the sentence and the way home under it, and the
 * warm-up panel where the hero has its screenshot. From md the panel
 * straddles the seam at the right, clear of the headline; below that it
 * follows the sentence.
 */
const NotFound = () => (
  <section className="relative overflow-hidden bg-bg [--seam-y:calc((100svh-var(--nav-h))*0.46)] sm:[--seam-y:calc((100svh-var(--nav-h))*0.5)]">
    <div className="h-(--seam-y)" aria-hidden="true" />

    <div className="min-h-(--seam-y) bg-accent-strong">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-[calc(var(--text-display)*0.5+2rem)] pb-16 sm:px-6">
        <div className="flex flex-col items-start gap-6 md:max-w-[calc(100%-min(27.5rem,40vw)-3rem)]">
          <p className="rise-in text-lead text-on-accent">
            There&apos;s no page at this address. Take a warm-up shot, or head
            back home.
          </p>
          <Button
            to="/"
            variant="inverse"
            size="lg"
            style={{ '--rise': 1 }}
            className="rise-in"
          >
            Back to home
          </Button>
        </div>

        <div className="md:absolute md:top-(--seam-y) md:right-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))] md:w-[min(27.5rem,40vw)] md:-translate-y-1/2">
          <WarmupTarget riseIn />
        </div>
      </div>
    </div>

    <div className="pointer-events-none absolute inset-0">
      <div className="relative mx-auto h-full max-w-6xl px-4 sm:px-6">
        <WaterlineHeadline lines={HEADLINE_LINES} />
      </div>
    </div>
  </section>
)

export default NotFound
