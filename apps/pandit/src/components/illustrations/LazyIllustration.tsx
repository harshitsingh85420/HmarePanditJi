'use client'

import React, { useEffect, useState } from 'react'
import { IllustrationSkeleton } from './Skeleton'

interface LazyIllustrationProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

export function LazyIllustration({ name, size = 'md', animated = true }: LazyIllustrationProps) {
  const [Illustration, setIllustration] = useState<React.ComponentType<any> | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadIllustration = async () => {
      try {
        const mod = await import(`@/components/illustrations/${name}.tsx`)
        if (mounted) {
          setIllustration(() => mod.default)
        }
      } catch (err) {
        console.error(`Failed to load illustration: ${name}`, err)
        if (mounted) {
          setError(true)
        }
      }
    }

    loadIllustration()

    return () => {
      mounted = false
    }
  }, [name])

  if (error) {
    // Fallback emoji illustration
    return (
      <div className={`flex items-center justify-center bg-saffron-lt rounded-full ${size === 'lg' ? 'w-48 h-48 text-7xl' :
          size === 'md' ? 'w-32 h-32 text-5xl' :
            'w-20 h-20 text-3xl'
        }`}>
        🙏
      </div>
    )
  }

  if (!Illustration) {
    return <IllustrationSkeleton size={size} />
  }

  return <Illustration size={size} animated={animated} />
}
