'use client'

interface VoiceIndicatorProps {
  isListening: boolean
  label?: string
}

export default function VoiceIndicator({
  isListening,
  label = 'सुन रहा हूँ...',
}: VoiceIndicatorProps) {
  if (!isListening) return null

  return (
    <div className="flex items-center gap-3 py-2">
      {/* Animated bars */}
      <div className="flex items-end gap-1 h-6">
        <div className="voice-bar" />
        <div className="voice-bar" style={{ animationDelay: '0.2s' }} />
        <div className="voice-bar" style={{ animationDelay: '0.4s' }} />
      </div>
      <span className="text-saffron text-lg">{label}</span>
    </div>
  )
}
