import { useEffect, useState } from "react"

const EXIT_DURATION_MS = 280

/**
 * Mount/enter/exit timing for `BottomSheet`, matching `ProfileModal`:
 * render first, flip to visible on the next paint, and keep the node mounted
 * for the length of the exit transition.
 */
export function useSheetAnimation(isOpen: boolean) {
  const [isRendered, setIsRendered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mount must happen before the enter transition can run
      setIsRendered(true)
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true))
      })
      return () => cancelAnimationFrame(frame)
    }

    setIsVisible(false)
    const timeout = setTimeout(() => setIsRendered(false), EXIT_DURATION_MS)
    return () => clearTimeout(timeout)
  }, [isOpen])

  return { isRendered, isVisible }
}
