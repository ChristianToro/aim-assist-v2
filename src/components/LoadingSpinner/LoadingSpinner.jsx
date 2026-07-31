const LoadingSpinner = ({ className = '' }) => (
  <div
    role="status"
    aria-label="Loading"
    className={`h-6 w-6 animate-spin rounded-full border-2 border-edge border-t-accent ${className}`}
  />
)

export default LoadingSpinner
