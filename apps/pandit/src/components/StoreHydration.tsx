'use client';

import * as React from 'react';
import { useNavigationStore } from '@/stores/navigationStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useRegistrationStore } from '@/stores/registrationStore';

/**
 * StoreHydration - Handles rehydration of Zustand persist stores after SSR
 * 
 * This component ensures all persisted stores are properly hydrated on the client
 * after the initial server-side render completes. This prevents hydration mismatches
 * caused by localStorage access during SSR.
 * 
 * MUST be rendered in root layout with 'use client' directive
 */
export function StoreHydration() {
  React.useEffect(() => {
    // Rehydrate all persist stores on client side only
    useNavigationStore.persist.rehydrate();
    useOnboardingStore.persist.rehydrate();
    useRegistrationStore.persist.rehydrate();
  }, []);

  return null;
}
