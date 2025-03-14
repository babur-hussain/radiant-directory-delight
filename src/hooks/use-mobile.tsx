
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Set initial value
    const checkIsMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Check initially
    checkIsMobile()
    
    // Add resize listener
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", checkIsMobile)
    
    return () => mql.removeEventListener("change", checkIsMobile)
  }, [])

  return isMobile
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia(query)
    
    // Set initial value
    setMatches(media.matches)
    
    // Update matches on change
    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)
    
    return () => media.removeEventListener("change", listener)
  }, [query])

  return matches
}
