import LoadingSpinner from '../LoadingSpinner/LoadingSpinner'

// Suspense fallback while a lazy-loaded page chunk downloads.
const LoadingScreen = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
    <span aria-hidden="true" className="text-3xl text-accent">
      ◎
    </span>
    <LoadingSpinner />
  </div>
)

export default LoadingScreen
