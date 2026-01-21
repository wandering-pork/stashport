'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { TemplatePreview } from './template-preview'
import {
  TemplateStyle,
  TemplateFormat,
  TEMPLATE_STYLES,
  TEMPLATE_FORMATS,
} from '@/lib/constants/templates'
import { ItineraryWithDays } from '@/lib/types/models'
import { Download, Share2 } from 'lucide-react'

interface ShareModalProps {
  itinerary: ItineraryWithDays
  isOpen: boolean
  onClose: () => void
}

export function ShareModal({ itinerary, isOpen, onClose }: ShareModalProps) {
  const [selectedStyle, setSelectedStyle] = useState<TemplateStyle>('clean')
  const [selectedFormat, setSelectedFormat] = useState<TemplateFormat>('square')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  console.log('[Component] ShareModal - Render:', {
    isOpen,
    selectedStyle,
    selectedFormat,
    itineraryId: itinerary.id,
  })

  // Calculate stats for template
  const dayCount = itinerary.days?.length || 0
  const activityCount =
    itinerary.days?.reduce((sum, day) => sum + (day.activities?.length || 0), 0) || 0

  const templateData = {
    title: itinerary.title,
    destination: itinerary.destination || undefined,
    coverPhotoUrl: itinerary.cover_photo_url || undefined,
    dayCount: dayCount > 0 ? dayCount : undefined,
    activityCount: activityCount > 0 ? activityCount : undefined,
  }

  const handleGenerate = async () => {
    console.log('[Component] ShareModal - Generate image:', {
      style: selectedStyle,
      format: selectedFormat,
    })

    setError(null)
    setIsGenerating(true)

    try {
      const response = await fetch('/api/share/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itineraryId: itinerary.id,
          style: selectedStyle,
          format: selectedFormat,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate image')
      }

      // Download the generated image
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${itinerary.slug}-${selectedFormat}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log('[Component] ShareModal - Image downloaded successfully')
    } catch (err: any) {
      console.error('[Component] ShareModal - Generate error:', err)
      setError(err.message || 'Failed to generate image')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader onClose={onClose}>
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Your Trip
          </div>
        </DialogHeader>

        <DialogContent>
          <div className="space-y-6">
          {/* Template Style Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-heading font-medium text-gray-700">
              Template Style
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(TEMPLATE_STYLES).map(([key, config]) => (
                <Card
                  key={key}
                  variant={selectedStyle === key ? 'elevated' : 'default'}
                  accentColor={selectedStyle === key ? 'primary' : undefined}
                  className={cn(
                    'cursor-pointer transition-all',
                    selectedStyle === key && 'ring-2 ring-primary-500'
                  )}
                  onClick={() => {
                    console.log('[Component] ShareModal - Style selected:', key)
                    setSelectedStyle(key as TemplateStyle)
                  }}
                >
                  <CardContent padding="default" className="text-center">
                    <h3 className="font-heading font-semibold">{config.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{config.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-heading font-medium text-gray-700">
              Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(TEMPLATE_FORMATS).map(([key, config]) => (
                <Card
                  key={key}
                  variant={selectedFormat === key ? 'elevated' : 'default'}
                  accentColor={selectedFormat === key ? 'primary' : undefined}
                  className={cn(
                    'cursor-pointer transition-all',
                    selectedFormat === key && 'ring-2 ring-primary-500'
                  )}
                  onClick={() => {
                    console.log('[Component] ShareModal - Format selected:', key)
                    setSelectedFormat(key as TemplateFormat)
                  }}
                >
                  <CardContent padding="default" className="text-center">
                    <div className="text-2xl font-bold font-display mb-1">{config.ratio}</div>
                    <h3 className="font-heading font-semibold text-sm">{config.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{config.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <label className="block text-sm font-heading font-medium text-gray-700">
              Preview
            </label>
            <div className="flex justify-center p-6 bg-gray-50 rounded-lg">
              <TemplatePreview
                style={selectedStyle}
                format={selectedFormat}
                data={templateData}
                scale={0.3}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose} disabled={isGenerating}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleGenerate}
              isLoading={isGenerating}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download Image
            </Button>
          </div>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  )
}
