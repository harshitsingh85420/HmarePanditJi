'use client';

import { useState, useEffect } from 'react';

/**
 * useHydration - Hook to check if Zustand stores have been hydrated
 * 
 * Returns true after the component has mounted on the client,
 * indicating that persisted state from localStorage is available.
 * 
 * Use this hook in components that read from Zustand persist stores
 * to prevent SSR hydration mismatches.
 * 
 * @example
 * ```tsx
 * const Component = () => {
 *   const hydrated = useHydration();
 *   const bears = useBearStore(state => state.bears);
 *   
 *   if (!hydrated) return <Loading />;
 *   return <div>{bears} bears</div>;
 * }
 * ```
 */
export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
