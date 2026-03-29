/**
 * SSR-Safe Store Hooks
 *
 * Re-exports Zustand stores directly. SSR safety is handled by:
 * 1. skipHydration: true in each store
 * 2. StoreHydrationClient component (dynamic import, ssr: false)
 * 3. All consuming pages/layouts are 'use client'
 *
 * Usage:
 *   import { useSafeNavigationStore } from '@/lib/stores/ssr-safe-stores'
 *
 *   function MyComponent() {
 *     const { setSection } = useSafeNavigationStore()
 *   }
 */

'use client'

import { useNavigationStore } from '@/stores/navigationStore'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { useRegistrationStore } from '@/stores/registrationStore'
import { useVoiceStore } from '@/stores/voiceStore'
import { useUIStore } from '@/stores/uiStore'
import { useLanguageStore } from '@/stores/languageStore'

/**
 * SSR-safe navigation store hook
 */
export function useSafeNavigationStore() {
  return useNavigationStore()
}

/**
 * SSR-safe onboarding store hook
 */
export function useSafeOnboardingStore() {
  return useOnboardingStore()
}

/**
 * SSR-safe registration store hook
 */
export function useSafeRegistrationStore() {
  return useRegistrationStore()
}

/**
 * SSR-safe voice store hook
 */
export function useSafeVoiceStore() {
  return useVoiceStore()
}

/**
 * SSR-safe UI store hook
 */
export function useSafeUIStore() {
  return useUIStore()
}

/**
 * SSR-safe language store hook
 */
export function useSafeLanguageStore() {
  return useLanguageStore()
}
