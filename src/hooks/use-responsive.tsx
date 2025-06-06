
import { useState, useEffect } from "react";

// Breakpoint sizes (in pixels)
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768, 
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

type Breakpoint = keyof typeof breakpoints;

export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const [isGreaterThan, setIsGreaterThan] = useState<boolean>(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${breakpoints[breakpoint]}px)`);
    
    // Set initial value
    setIsGreaterThan(mediaQuery.matches);
    
    // Add listener for changes
    const handleChange = (e: MediaQueryListEvent) => setIsGreaterThan(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    // Cleanup
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [breakpoint]);
  
  return isGreaterThan;
}

export function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>> & { default: T }): T {
  // Create state for each possible breakpoint
  const isSm = useBreakpoint('sm');
  const isMd = useBreakpoint('md');
  const isLg = useBreakpoint('lg');
  const isXl = useBreakpoint('xl');
  const is2Xl = useBreakpoint('2xl');
  
  // Return the appropriate value based on current breakpoints
  if (is2Xl && values['2xl'] !== undefined) return values['2xl'];
  if (isXl && values.xl !== undefined) return values.xl;
  if (isLg && values.lg !== undefined) return values.lg;
  if (isMd && values.md !== undefined) return values.md;
  if (isSm && values.sm !== undefined) return values.sm;
  if (values.xs !== undefined) return values.xs;
  
  // Return default if no breakpoints match
  return values.default;
}

// Hook for simple checks if we're on a mobile device
export function useIsMobile(): boolean {
  return !useBreakpoint('md'); // Less than 768px is considered mobile
}
