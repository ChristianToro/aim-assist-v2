// An inline busy mark beside a status line. Ink on a quiet ring: the
// accent is kept for the selection line.
const LoadingSpinner = ({ className = '' }) => (
  <span
    role="status"
    aria-label="Loading"
    className={`inline-block size-5 animate-spin rounded-full border-2 border-edge border-t-heading ${className}`}
  />
)

export default LoadingSpinner
