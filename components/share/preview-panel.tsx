'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'
import { TemplatePreview } from '@/components/itinerary/template-preview'
import { TemplateStyle, TemplateFormat } from '@/lib/constants/templates'
import { Loader2 } from 'lucide-react'

interface PreviewPanelProps {
  style: TemplateStyle
  format: TemplateFormat
  data: {
    title: string
    destination?: string
    coverPhotoUrl?: string
    dayCount?: number
    activityCount?: number
  }
}

export function PreviewPanel({ style, format, data }: PreviewPanelProps) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayStyle, setDisplayStyle] = useState(style)

  // Smooth crossfade when style changes
  useEffect(() => {
    if (style !== displayStyle) {
      setIsTransitioning(true)
      const timer = setTimeout(() => {
        setDisplayStyle(style)
        setIsTransitioning(false)
      }, 150) // Half of transition duration for crossfade effect
      return () => clearTimeout(timer)
    }
  }, [style, displayStyle])

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="space-y-1">
        <h3 className="font-display text-lg font-bold text-neutral-900 tracking-tight">
          Preview
        </h3>
        <p className="font-body text-xs text-neutral-500">
          Your share image at 60% scale
        </p>
      </div>

      {/* Preview Container */}
      <div className="relative">
        {/* Decorative Background Elements */}
        <div className="absolute -inset-4 bg-gradient-to-br from-neutral-100 via-cream to-neutral-50 rounded-2xl -z-10 opacity-60" />

        {/* Corner Accents - Editorial Detail */}
        <div className="absolute -top-2 -left-2 w-16 h-16 border-l-2 border-t-2 border-primary-300 rounded-tl-xl opacity-40" />
        <div className="absolute -bottom-2 -right-2 w-16 h-16 border-r-2 border-b-2 border-secondary-300 rounded-br-xl opacity-40" />

        {/* Main Preview Area */}
        <div className={cn(
          "relative bg-white rounded-xl border-2 border-neutral-200 p-6 lg:p-8",
          "shadow-lg transition-shadow duration-300",
          "hover:shadow-xl"
        )}>
          {/* Preview Content */}
          <div className="flex justify-center items-center min-h-[320px] lg:min-h-[400px]">
            <div className={cn(
              "transition-opacity duration-300",
              isTransitioning ? "opacity-0" : "opacity-100"
            )}>
              <TemplatePreview
                style={displayStyle}
                format={format}
                data={data}
                scale={0.6}
              />
            </div>

            {/* Transition Loader */}
            {isTransitioning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                  <p className="font-body text-sm text-neutral-500">Updating preview...</p>
                </div>
              </div>
            )}
          </div>

          {/* Format Dimensions Label */}
          <div className="mt-4 flex justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary-500 animate-pulse" />
              <span className="font-heading text-[10px] font-semibold text-neutral-700 uppercase tracking-wider">
                {format === 'story' && '1080 × 1920'}
                {format === 'square' && '1080 × 1080'}
                {format === 'portrait' && '1080 × 1350'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
