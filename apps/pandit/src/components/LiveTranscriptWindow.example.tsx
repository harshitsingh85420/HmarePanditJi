'use client'

import { useState } from 'react'
import { LiveTranscriptWindow } from './LiveTranscriptWindow'
import CTAButton from './CTAButton'

/**
 * Example usage of LiveTranscriptWindow component
 * 
 * This demonstrates:
 * - Basic usage with default props
 * - Toggling visibility
 * - Custom configuration options
 */
export function LiveTranscriptWindowExample() {
  const [isVisible, setIsVisible] = useState(true)
  const [showConfidence, setShowConfidence] = useState(true)
  const [showTimestamps, setShowTimestamps] = useState(true)

  return (
    <div className="min-h-screen bg-background p-screen-md">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-title-2xl font-bold text-text-primary mb-2">
            Live Transcript Window Demo
          </h1>
          <p className="text-body-md text-text-secondary">
            Real-time speech-to-text display with mock data
          </p>
        </div>

        {/* Controls */}
        <div className="bg-surface-card rounded-card shadow-card p-5 space-y-4">
          <h2 className="text-title-md font-bold text-text-primary">
            Controls
          </h2>
          
          <div className="flex flex-wrap gap-3">
            <CTAButton
              label={isVisible ? 'Hide Transcript' : 'Show Transcript'}
              onClick={() => setIsVisible(!isVisible)}
              variant={isVisible ? 'secondary' : 'primary'}
              fullWidth={false}
            />
            
            <CTAButton
              label={showConfidence ? 'Hide Confidence' : 'Show Confidence'}
              onClick={() => setShowConfidence(!showConfidence)}
              variant="ghost"
              fullWidth={false}
            />
            
            <CTAButton
              label={showTimestamps ? 'Hide Timestamps' : 'Show Timestamps'}
              onClick={() => setShowTimestamps(!showTimestamps)}
              variant="ghost"
              fullWidth={false}
            />
          </div>
        </div>

        {/* Live Transcript Window */}
        <LiveTranscriptWindow
          isVisible={isVisible}
          showConfidence={showConfidence}
          showTimestamps={showTimestamps}
          maxEntries={10}
          autoScroll={true}
        />

        {/* Usage Example Code */}
        <div className="bg-surface-card rounded-card shadow-card p-5">
          <h2 className="text-title-md font-bold text-text-primary mb-4">
            Usage
          </h2>
          <pre className="bg-surface-muted rounded-lg p-4 overflow-x-auto text-body-sm text-text-secondary">
{`<LiveTranscriptWindow
  isVisible={true}
  showConfidence={true}
  showTimestamps={true}
  maxEntries={10}
  autoScroll={true}
/>`}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default LiveTranscriptWindowExample
