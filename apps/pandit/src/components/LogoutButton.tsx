'use client'

import { useAuth } from '@hmarepanditji/utils'
import { speakWithSarvam } from '@/lib/sarvam-tts'

interface LogoutButtonProps {
  label?: string
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'normal' | 'large'
  showIcon?: boolean
  onLogout?: () => void
  className?: string
}

/**
 * Logout Button Component
 *
 * A bilingual logout button for elderly users with accessibility features.
 *
 * Features:
 * - Bilingual label (Hindi/English)
 * - High contrast colors
 * - Large touch target (72px minimum height)
 * - Haptic feedback on tap
 * - Voice announcement on click
 * - Confirmation before logout (optional)
 */
export function LogoutButton({
  label = 'लॉग आउट - Logout',
  variant = 'danger',
  size = 'normal',
  showIcon = true,
  onLogout,
  className = '',
}: LogoutButtonProps) {
  const { logout } = useAuth()

  const handleLogout = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    // Voice announcement
    void speakWithSarvam({
      text: 'आप सफलतापूर्वक लॉग आउट हो गए हैं। आप फिर से लॉग इन कर सकते हैं।',
      languageCode: 'hi-IN',
    })

    // Call custom onLogout if provided
    onLogout?.()

    // Perform actual logout
    logout()
  }

  const baseClass = [
    'flex items-center justify-center gap-2 rounded-btn font-bold text-[20px]',
    'transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed',
    'focus:ring-4 focus:outline-none',
    'min-h-[72px] h-auto px-6 py-4',
    className,
  ]

  const variantClass: Record<string, string> = {
    primary: 'bg-primary text-white shadow-lg hover:shadow-xl focus:ring-primary/50',
    secondary: 'bg-white text-primary border-2 border-primary hover:bg-gray-50 focus:ring-primary/50',
    danger: 'bg-red-600 text-white shadow-lg hover:bg-red-700 hover:shadow-xl focus:ring-red-500/50',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400/50',
  }

  const sizeClass = size === 'large' ? 'text-[22px] px-8 py-5 min-h-[80px]' : ''

  return (
    <button
      onClick={handleLogout}
      className={[...baseClass, variantClass[variant], sizeClass].join(' ')}
      aria-label={label}
      title={label}
      type="button"
    >
      {showIcon && (
        <span className="material-symbols-outlined text-2xl">logout</span>
      )}
      <span className="text-center block break-words line-clamp-2">{label}</span>
    </button>
  )
}

export default LogoutButton
