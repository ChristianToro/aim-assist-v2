import heroImage from '../../assets/hero-img.webp'
import StartTrainingButton from './StartTrainingButton'
import WaterlineHeadline from './WaterlineHeadline'

const HEADLINE_LINES = ['Train', 'your aim']
const HERO_IMAGE_SIZE = { width: 1319, height: 1192 }

// "Waterline" hero: two flat fields meet at --seam-y, and the seam cuts
// through the headline's second line (see WaterlineHeadline).
const Hero = () => (
  <section className="relative overflow-hidden bg-bg [--seam-y:calc((100svh-var(--nav-h))*0.46)] sm:[--seam-y:calc((100svh-var(--nav-h))*0.5)]">
    <div className="h-(--seam-y)" aria-hidden="true" />

    {/* Lower field: grows only if its text needs more than half. */}
    <div className="relative min-h-(--seam-y) bg-accent-strong">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-[calc(var(--text-display)*0.5+2rem)] pb-16 sm:px-6 md:grid md:min-h-(--seam-y) md:grid-cols-12 md:items-end md:gap-6">
        <div className="rise-in flex flex-col items-start gap-6 md:col-span-7 lg:col-span-6">
          <p className="text-lead text-on-accent">
            A free aim trainer in your browser: six modes, 30-second rounds,
            global leaderboards.
          </p>
          <StartTrainingButton variant="inverse" size="lg" />
        </div>

        {/* From md up the screenshot is pinned to the right and cropped by
            the hero's bottom edge, so it never stretches the field. */}
        <div className="w-[78%] self-end overflow-hidden rotate-4 md:absolute md:top-[calc(var(--text-display)*0.5+2.5rem)] md:right-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))] md:w-[min(38%,30rem)]">
          <img
            src={heroImage}
            {...HERO_IMAGE_SIZE}
            fetchPriority="high"
            alt="A Gridshot round in progress: three cyan targets streak across the arena toward the cursor, with time, score and accuracy above."
            className="slow-drift block h-auto w-full"
          />
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

export default Hero
