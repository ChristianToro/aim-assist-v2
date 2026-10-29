import { useLayoutEffect, useRef } from 'react'

const OBSERVER_OPTIONS = { rootMargin: '0px 0px -12% 0px', threshold: 0.1 }

/*
 * Reveal-on-scroll, once. Returns a ref for a container; every
 * `[data-reveal]` inside it gets `.is-in` the first time it enters the
 * viewport (styles in index.css). The container is marked ready only once
 * the observer is running, so without one nothing is ever hidden.
 */
export const useReveal = () => {
  const containerRef = useRef(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container || !('IntersectionObserver' in window)) return undefined

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-in')
        observer.unobserve(entry.target)
      }
    }, OBSERVER_OPTIONS)

    container.querySelectorAll('[data-reveal]').forEach((element) => {
      observer.observe(element)
    })
    container.setAttribute('data-reveal-ready', '')

    return () => {
      observer.disconnect()
      container.removeAttribute('data-reveal-ready')
    }
  }, [])

  return containerRef
}
