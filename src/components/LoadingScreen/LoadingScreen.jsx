// While a page isn't ready (its chunk downloading, or the session
// restoring before a protected route): the app screens' title row in
// grey bars, inside the page frame. It fades in after a short delay, so
// a fast load shows nothing at all.
const LoadingScreen = () => (
  <section
    aria-busy="true"
    className="mx-auto max-w-6xl animate-fade-in px-4 py-10 [animation-delay:300ms] sm:px-6"
  >
    <p role="status" className="sr-only">
      Loading page
    </p>
    <div aria-hidden="true">
      <div className="h-[1.2em] w-40 bg-surface text-title" />
      <div className="mt-1 h-[1.43em] w-72 max-w-full bg-surface text-ui" />
    </div>
  </section>
)

export default LoadingScreen
