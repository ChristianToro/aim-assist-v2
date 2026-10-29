import { useEffect, useId, useRef, useState } from 'react'

const OVERLAY_SHADOW = 'shadow-lg' // taste-skill-ignore: it floats over the page

// `center` sits under the trigger's middle. `start` lines up with its left
// edge, for a trigger at the left of a narrow column.
const alignments = {
  center: 'left-1/2 -translate-x-1/2',
  start: 'left-0',
}

const sizes = {
  sm: 'max-w-[min(18rem,calc(100vw-2rem))]',
  lg: 'max-w-[min(24rem,calc(100vw-2rem))]',
}

/*
 * A hint under one trigger. It opens on hover, focus or click (click is
 * what a touch screen sends) and closes on Escape, an outside press, blur
 * or the pointer leaving. `children` is a render prop that receives the
 * props the trigger needs, so any element can be the trigger. The gap
 * above the box is padding, not margin, so the pointer can cross it onto
 * the hint without closing it.
 */
const Tooltip = ({ content, align = 'center', size = 'sm', children }) => {
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
        className={`absolute top-full z-20 w-max pt-2 ${alignments[align]} ${sizes[size]}`}
      >
        <span
          className={`block animate-fade-in bg-raised px-3 py-2 text-caption text-heading ${OVERLAY_SHADOW}`}
        >
          {content}
        </span>
      </span>
    </span>
  )
}

export default Tooltip
