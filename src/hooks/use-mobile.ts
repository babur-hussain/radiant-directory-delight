
import React, { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Set initial value
    const checkIsMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    
    // Add resize listener with debounce for performance
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkIsMobile, 100);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Initial check
    checkIsMobile();
    
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);
    
    // Update matches on change
    const listener = () => setMatches(media.matches);
    
    // Use the modern addEventListener method
    try {
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    } catch (err) {
      // Fallback for older browsers
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [query]);

  return matches;
}
