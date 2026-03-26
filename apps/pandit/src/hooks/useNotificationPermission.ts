/**
 * Notification Permission Hook
 * Manages browser notification permission state
 */

import { useState, useEffect, useCallback } from 'react'

export type NotificationPermission = 'granted' | 'denied' | 'default'

interface UseNotificationPermissionResult {
  permission: NotificationPermission
  requestPermission: () => Promise<boolean>
  isSupported: boolean
}

/**
 * Hook to manage notification permission
 */
export function useNotificationPermission(): UseNotificationPermissionResult {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if notifications are supported
    const supported = 'Notification' in window
    setIsSupported(supported)

    if (supported) {
      // Get current permission state
      setPermission(Notification.permission as NotificationPermission)
    }
  }, [])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.log('[Notification] Not supported')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result as NotificationPermission)
      return result === 'granted'
    } catch (error) {
      console.error('[Notification] Request permission failed:', error)
      setPermission('denied')
      return false
    }
  }, [isSupported])

  return {
    permission,
    requestPermission,
    isSupported,
  }
}

/**
 * Check if push notifications are supported (for Firebase)
 */
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false
  return (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  )
}

/**
 * Get current notification permission state
 */
export function getCurrentPermission(): NotificationPermission {
  if (typeof window === 'undefined') return 'default'
  if (!('Notification' in window)) return 'denied'
  return Notification.permission as NotificationPermission
}
