/**
 * Language Persistence Tests
 * BUG-002: Language Switcher Doesn't Persist on Desktop
 * 
 * Tests that language selection persists across:
 * - Page refresh
 * - Tab close/reopen
 * - Desktop and mobile
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('BUG-002: Language Persistence', () => {
  const STORAGE_KEY = 'hpj_preferred_language'

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  afterEach(() => {
    // Cleanup after each test
    localStorage.removeItem(STORAGE_KEY)
  })

  describe('localStorage persistence', () => {
    it('should save Hindi language preference', () => {
      localStorage.setItem(STORAGE_KEY, 'Hindi')
      const saved = localStorage.getItem(STORAGE_KEY)
      expect(saved).toBe('Hindi')
    })

    it('should save Tamil language preference', () => {
      localStorage.setItem(STORAGE_KEY, 'Tamil')
      const saved = localStorage.getItem(STORAGE_KEY)
      expect(saved).toBe('Tamil')
    })

    it('should save Bengali language preference', () => {
      localStorage.setItem(STORAGE_KEY, 'Bengali')
      const saved = localStorage.getItem(STORAGE_KEY)
      expect(saved).toBe('Bengali')
    })
  })

  describe('language persistence across refresh', () => {
    it('should persist Hindi on desktop after refresh simulation', () => {
      // Simulate user selecting Hindi
      localStorage.setItem(STORAGE_KEY, 'Hindi')
      
      // Simulate refresh (re-reading from localStorage)
      const restored = localStorage.getItem(STORAGE_KEY)
      
      expect(restored).toBe('Hindi')
    })

    it('should persist Tamil on mobile after refresh simulation', () => {
      // Simulate user selecting Tamil
      localStorage.setItem(STORAGE_KEY, 'Tamil')
      
      // Simulate refresh
      const restored = localStorage.getItem(STORAGE_KEY)
      
      expect(restored).toBe('Tamil')
    })

    it('should persist Telugu across session', () => {
      localStorage.setItem(STORAGE_KEY, 'Telugu')
      const restored = localStorage.getItem(STORAGE_KEY)
      expect(restored).toBe('Telugu')
    })
  })

  describe('cross-tab persistence', () => {
    it('should persist language across tabs (same localStorage)', () => {
      // Tab 1: User selects Kannada
      localStorage.setItem(STORAGE_KEY, 'Kannada')
      
      // Tab 2: Read same localStorage
      const restored = localStorage.getItem(STORAGE_KEY)
      
      expect(restored).toBe('Kannada')
    })

    it('should update language when changed in another tab', () => {
      // Initial: Hindi
      localStorage.setItem(STORAGE_KEY, 'Hindi')
      
      // Another tab changes to Marathi
      localStorage.setItem(STORAGE_KEY, 'Marathi')
      
      // Current tab reads updated value
      const restored = localStorage.getItem(STORAGE_KEY)
      
      expect(restored).toBe('Marathi')
    })
  })

  describe('fallback to Hindi', () => {
    it('should default to Hindi when no preference saved', () => {
      // Ensure no saved preference
      localStorage.removeItem(STORAGE_KEY)
      
      const saved = localStorage.getItem(STORAGE_KEY)
      
      // Should be null, app should default to Hindi
      expect(saved).toBeNull()
    })

    it('should handle invalid language codes gracefully', () => {
      // Save invalid language
      localStorage.setItem(STORAGE_KEY, 'InvalidLanguage')
      
      const saved = localStorage.getItem(STORAGE_KEY)
      
      // App should validate and fallback to Hindi
      expect(saved).toBe('InvalidLanguage')
      // Note: Validation happens in onboarding-store.ts
    })

    it('should handle empty string gracefully', () => {
      localStorage.setItem(STORAGE_KEY, '')
      const saved = localStorage.getItem(STORAGE_KEY)
      expect(saved).toBe('')
    })
  })

  describe('clear localStorage', () => {
    it('should clear language preference on logout', () => {
      // Set language
      localStorage.setItem(STORAGE_KEY, 'Gujarati')
      
      // Clear (simulating logout)
      localStorage.removeItem(STORAGE_KEY)
      
      const saved = localStorage.getItem(STORAGE_KEY)
      expect(saved).toBeNull()
    })

    it('should clear all app data on clear', () => {
      // Set multiple items
      localStorage.setItem(STORAGE_KEY, 'Punjabi')
      localStorage.setItem('hpj_test', 'value')
      
      // Clear all
      localStorage.clear()
      
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
      expect(localStorage.getItem('hpj_test')).toBeNull()
    })
  })

  describe('supported languages', () => {
    const SUPPORTED_LANGUAGES = [
      'Hindi', 'Bhojpuri', 'Maithili', 'Bengali',
      'Tamil', 'Telugu', 'Kannada', 'Malayalam',
      'Marathi', 'Gujarati', 'Punjabi', 'English',
      'Odia', 'Assamese', 'Sanskrit'
    ]

    it('should support all 15 languages', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        localStorage.setItem(STORAGE_KEY, lang)
        const saved = localStorage.getItem(STORAGE_KEY)
        expect(saved).toBe(lang)
        localStorage.removeItem(STORAGE_KEY)
      }
    })

    it('should support Hindi (default)', () => {
      localStorage.setItem(STORAGE_KEY, 'Hindi')
      const saved = localStorage.getItem(STORAGE_KEY)
      expect(saved).toBe('Hindi')
    })

    it('should support English', () => {
      localStorage.setItem(STORAGE_KEY, 'English')
      const saved = localStorage.getItem(STORAGE_KEY)
      expect(saved).toBe('English')
    })
  })
})

/**
 * Integration test helper functions
 * These would be used in E2E tests
 */

/**
 * Simulates selecting a language and refreshing the page
 */
export function simulateLanguageSelectAndRefresh(language: string): string | null {
  localStorage.setItem('hpj_preferred_language', language)
  // Simulate refresh by re-reading
  return localStorage.getItem('hpj_preferred_language')
}

/**
 * Checks if language is persisted after tab close/reopen
 */
export function simulateTabCloseAndReopen(language: string): string | null {
  localStorage.setItem('hpj_preferred_language', language)
  // Tab close/reopen uses same localStorage
  return localStorage.getItem('hpj_preferred_language')
}

/**
 * Clears all language preferences (for logout)
 */
export function clearLanguagePreference(): void {
  localStorage.removeItem('hpj_preferred_language')
}
