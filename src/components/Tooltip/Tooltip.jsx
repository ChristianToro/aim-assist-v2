import { useEffect, useId, useRef, useState } from 'react'

const OVERLAY_SHADOW = 'shadow-lg' // taste-skill-ignore: it floats over the page

/*
 * A short hint under one trigger. It opens on hover, focus or click (click
 * is what a touch screen sends) and closes on Escape, an outside press,
 * blur or the pointer leaving. `children` is a render prop that receives
 * the props the trigger needs, so any element can be the trigger.
 */
const Tooltip = ({ content, children }) => {
  const id = useId()
  const wrapperRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  useEffect(() => {
    if (!isOpen) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    const closeOnOutsidePress = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setIsOpen(false)
    }

    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('pointerdown', closeOnOutsidePress)
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('pointerdown', closeOnOutsidePress)
    }
  }, [isOpen])

  return (
    <span
      ref={wrapperRef}
      className="relative inline-flex"
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
    >
      {children({ 'aria-describedby': id, onClick: open })}
      <span
        id={id}
        role="tooltip"
        hidden={!isOpen}
        className={`absolute top-full left-1/2 z-20 mt-2 w-max max-w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 animate-fade-in bg-raised px-3 py-2 text-caption text-heading ${OVERLAY_SHADOW}`}
      >
        {content}
      </span>
    </span>
  )
}

export default Tooltip
