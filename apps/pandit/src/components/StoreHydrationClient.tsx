'use client';

import { useEffect } from 'react';
import { useNavigationStore } from '@/stores/navigationStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useRegistrationStore } from '@/stores/registrationStore';

/**
 * StoreHydrationClient - Client-side only component for Zustand store hydration
 * 
 * This component MUST only be rendered on the client side to prevent
 * hydration mismatches during SSR. It triggers rehydration of all
 * persisted Zustand stores from localStorage.
 */
export function StoreHydrationClient() {
  useEffect(() => {
    // Rehydrate all persist stores on client side only
    useNavigationStore.persist.rehydrate();
    useOnboardingStore.persist.rehydrate();
    useRegistrationStore.persist.rehydrate();
  }, []);

  return null;
}
