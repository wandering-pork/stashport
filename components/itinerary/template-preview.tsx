'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils/cn'
import { TemplateStyle, TemplateFormat, TEMPLATE_FORMATS } from '@/lib/constants/templates'

interface TemplatePreviewProps {
  style: TemplateStyle
  format: TemplateFormat
  data: {
    title: string
    destination?: string
    coverPhotoUrl?: string
    dayCount?: number
    activityCount?: number
  }
  scale?: number
}

export function TemplatePreview({
  style,
  format,
  data,
  scale = 0.3,
}: TemplatePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)
  const formatConfig = TEMPLATE_FORMATS[format]

  console.log('[Component] TemplatePreview - Render:', { style, format, scale })

  // Render the appropriate template based on style
  const renderTemplate = () => {
    const { width, height } = formatConfig

    // Base container styles
    const containerStyle: React.CSSProperties = {
      width: `${width}px`,
      height: `${height}px`,
      transformOrigin: 'top left',
      transform: `scale(${scale})`,
      position: 'relative',
      overflow: 'hidden',
    }

    // Clean template: cream background with elegant typography
    if (style === 'clean') {
      return (
        <div style={containerStyle} className="bg-cream font-display">
          <div className="absolute inset-0 p-16 flex flex-col justify-between">
            {/* Header */}
            <div>
              <h1 className="text-6xl font-bold text-gray-900 mb-4">
                {data.title || 'Untitled Trip'}
              </h1>
              {data.destination && (
                <p className="text-3xl text-gray-600 font-body">
                  {data.destination}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-8 font-heading text-2xl text-gray-700">
              {data.dayCount && (
                <div>
                  <span className="font-semibold">{data.dayCount}</span> Days
                </div>
              )}
              {data.activityCount && (
                <div>
                  <span className="font-semibold">{data.activityCount}</span> Activities
                </div>
              )}
            </div>

            {/* Footer branding */}
            <div className="text-xl text-gray-500 font-body">
              stashport.com
            </div>
          </div>
        </div>
      )
    }

    // Bold template: full-bleed photo with overlay
    if (style === 'bold') {
      return (
        <div style={containerStyle} className="relative">
          {data.coverPhotoUrl ? (
            <img
              src={data.coverPhotoUrl}
              alt="Cover"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500" />
          )}
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute inset-0 p-16 flex flex-col justify-between text-white">
            {/* Header */}
            <div>
              <h1 className="text-7xl font-bold font-display mb-4 drop-shadow-lg">
                {data.title || 'Untitled Trip'}
              </h1>
              {data.destination && (
                <p className="text-4xl font-body drop-shadow-md">
                  {data.destination}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-8 font-heading text-3xl">
              {data.dayCount && (
                <div>
                  <span className="font-semibold">{data.dayCount}</span> Days
                </div>
              )}
              {data.activityCount && (
                <div>
                  <span className="font-semibold">{data.activityCount}</span> Activities
                </div>
              )}
            </div>

            {/* Footer branding */}
            <div className="text-2xl font-body drop-shadow-md">
              stashport.com
            </div>
          </div>
        </div>
      )
    }

    // Minimal template: simple, clean design
    if (style === 'minimal') {
      return (
        <div style={containerStyle} className="bg-white">
          <div className="absolute inset-0 p-16 flex flex-col justify-center items-center text-center border-8 border-gray-200">
            <h1 className="text-6xl font-bold font-display text-gray-900 mb-6">
              {data.title || 'Untitled Trip'}
            </h1>
            {data.destination && (
              <p className="text-4xl text-gray-600 font-body mb-12">
                {data.destination}
              </p>
            )}

            {/* Stats */}
            {(data.dayCount || data.activityCount) && (
              <div className="flex gap-12 font-heading text-2xl text-gray-700 mb-12">
                {data.dayCount && (
                  <div>
                    <span className="font-semibold text-4xl block mb-2">{data.dayCount}</span>
                    Days
                  </div>
                )}
                {data.activityCount && (
                  <div>
                    <span className="font-semibold text-4xl block mb-2">{data.activityCount}</span>
                    Activities
                  </div>
                )}
              </div>
            )}

            {/* Footer branding */}
            <div className="text-xl text-gray-400 font-body mt-auto">
              stashport.com
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div
      className="inline-block bg-gray-100 rounded-lg overflow-hidden"
      style={{
        width: `${formatConfig.width * scale}px`,
        height: `${formatConfig.height * scale}px`,
      }}
    >
      <div ref={previewRef}>{renderTemplate()}</div>
    </div>
  )
}
