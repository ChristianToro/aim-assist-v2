import { useEffect, useRef } from 'react'

// Overlay dialog. Closes on Escape or overlay click. On open, focus
// moves into the dialog; on close it returns to the previously focused
// element (keyboard users don't lose their place).
const Modal = ({ open, onClose, title, children }) => {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement
    dialogRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    // An opaque-enough scrim sets the dialog apart; no blur, and the
    // dialog itself is an edge and a tone step, not a shadow.
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="w-full max-w-md animate-scale-in border border-edge bg-raised p-6 outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        {title && (
          <h2 className="text-title font-medium tracking-tight text-heading">
            {title}
          </h2>
        )}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

export default Modal
