'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { TemplatePreview } from './template-preview'
import {
  TemplateStyle,
  TemplateFormat,
  TEMPLATE_STYLES,
  TEMPLATE_FORMATS,
} from '@/lib/constants/templates'
import { ItineraryWithDays } from '@/lib/types/models'
import { Download, Share2, Sparkles } from 'lucide-react'

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
    <Dialog open={isOpen} onOpenChange={onClose} maxWidth="4xl" data-testid="share-modal">
      <DialogHeader onClose={onClose}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-neutral-900">Share Your Trip</h2>
            <p className="text-sm text-neutral-500 font-body">Create a beautiful social media post</p>
          </div>
        </div>
      </DialogHeader>

      <DialogContent>
        <div className="space-y-8">
          {/* Template Style Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-heading font-semibold text-neutral-800 uppercase tracking-wide">
                Template Style
              </label>
              <div className="h-px flex-1 bg-gradient-to-r from-neutral-200 to-transparent" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {Object.entries(TEMPLATE_STYLES).map(([key, config]) => {
                const isSelected = selectedStyle === key
                return (
                  <button
                    key={key}
                    onClick={() => {
                      console.log('[Component] ShareModal - Style selected:', key)
                      setSelectedStyle(key as TemplateStyle)
                    }}
                    aria-pressed={isSelected}
                    data-template={key}
                    data-selected={isSelected}
                    className={cn(
                      'group relative p-5 rounded-xl border-2 transition-all duration-300',
                      'hover:shadow-lg hover:-translate-y-1',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                      isSelected
                        ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-secondary-50 shadow-coral'
                        : 'border-neutral-200 bg-white hover:border-primary-300'
                    )}
                  >
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center shadow-lg animate-scale-in">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    )}

                    <div className="text-center space-y-2">
                      <h3 className={cn(
                        "font-display font-bold text-lg transition-colors",
                        isSelected ? "text-primary-700" : "text-neutral-900 group-hover:text-primary-600"
                      )}>
                        {config.name}
                      </h3>
                      <p className="text-xs text-neutral-600 leading-relaxed font-body">
                        {config.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-heading font-semibold text-neutral-800 uppercase tracking-wide">
                Format
              </label>
              <div className="h-px flex-1 bg-gradient-to-r from-neutral-200 to-transparent" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {Object.entries(TEMPLATE_FORMATS).map(([key, config]) => {
                const isSelected = selectedFormat === key
                return (
                  <button
                    key={key}
                    onClick={() => {
                      console.log('[Component] ShareModal - Format selected:', key)
                      setSelectedFormat(key as TemplateFormat)
                    }}
                    aria-pressed={isSelected}
                    data-format={key}
                    data-selected={isSelected}
                    className={cn(
                      'group relative p-5 rounded-xl border-2 transition-all duration-300',
                      'hover:shadow-lg hover:-translate-y-1',
                      'focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2',
                      isSelected
                        ? 'border-secondary-500 bg-gradient-to-br from-secondary-50 to-accent-50 shadow-teal'
                        : 'border-neutral-200 bg-white hover:border-secondary-300'
                    )}
                  >
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-secondary-500 flex items-center justify-center shadow-lg animate-scale-in">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    )}

                    <div className="text-center space-y-2">
                      <div className={cn(
                        "font-display font-bold text-3xl transition-colors mb-1",
                        isSelected ? "text-secondary-700" : "text-neutral-900 group-hover:text-secondary-600"
                      )}>
                        {config.ratio}
                      </div>
                      <h3 className={cn(
                        "font-heading font-semibold text-base transition-colors",
                        isSelected ? "text-secondary-700" : "text-neutral-900 group-hover:text-secondary-600"
                      )}>
                        {config.name}
                      </h3>
                      <p className="text-xs text-neutral-600 font-body">
                        {config.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-heading font-semibold text-neutral-800 uppercase tracking-wide">
                Preview
              </label>
              <div className="h-px flex-1 bg-gradient-to-r from-neutral-200 to-transparent" />
            </div>

            <div className="relative rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100 p-8 border border-neutral-200">
              {/* Decorative Corner Accents */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary-300 rounded-tl-xl" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-secondary-300 rounded-br-xl" />

              <div className="flex justify-center items-center min-h-[280px]">
                <TemplatePreview
                  style={selectedStyle}
                  format={selectedFormat}
                  data={templateData}
                  scale={0.3}
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 border-2 border-red-200 animate-shake" role="alert">
              <p className="text-sm text-red-800 font-body font-medium">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
            <p className="text-sm text-neutral-500 font-body">
              Your image will download automatically
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isGenerating}
                data-testid="close-modal"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleGenerate}
                isLoading={isGenerating}
                className="gap-2 shadow-coral hover:shadow-coral-lg"
              >
                <Download className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'Download Image'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
