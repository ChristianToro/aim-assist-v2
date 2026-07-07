import { useEffect } from 'react'

// Overlay dialog. Closes on Escape or overlay click.
// Will host the match results screen (Milestone 9) among others.
const Modal = ({ open, onClose, title, children }) => {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-xl border border-edge bg-raised p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {title && (
          <h2 className="text-xl font-semibold tracking-tight text-heading">
            {title}
          </h2>
        )}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

export default Modal
