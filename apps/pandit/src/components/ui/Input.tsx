'use client'

interface InputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'tel' | 'password' | 'number'
  label?: string
  error?: string
  disabled?: boolean
  className?: string
  maxLength?: number
  autoFocus?: boolean
}

export default function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  label,
  error,
  disabled = false,
  className,
  maxLength,
  autoFocus,
}: InputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-base font-medium text-vedic-brown mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        autoFocus={autoFocus}
        className={`
          w-full h-14 px-4
          text-lg text-vedic-brown
          bg-white border-2 rounded-btn
          placeholder:text-vedic-gold
          focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-error' : 'border-vedic-border'}
        `}
      />
      {error && (
        <p className="mt-2 text-base text-error">{error}</p>
      )}
    </div>
  )
}
