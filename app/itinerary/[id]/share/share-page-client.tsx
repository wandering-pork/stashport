'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { TemplateStyle, TemplateFormat, TEMPLATE_STYLES, TEMPLATE_FORMATS } from '@/lib/constants/templates'
import { ItineraryWithDays } from '@/lib/types/models'
import { TemplateSelector } from '@/components/share/template-selector'
import { FormatSelector } from '@/components/share/format-selector'
import { PreviewPanel } from '@/components/share/preview-panel'
import { DownloadPanel } from '@/components/share/download-panel'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { canShareFiles, shareImage } from '@/lib/utils/share-helpers'

const PREFS_KEY = 'stashport-share-prefs'

interface SharePageClientProps {
  itinerary: ItineraryWithDays
}

export function SharePageClient({ itinerary }: SharePageClientProps) {
  const router = useRouter()
  const [selectedStyle, setSelectedStyle] = useState<TemplateStyle>('clean')
  const [selectedFormat, setSelectedFormat] = useState<TemplateFormat>('square')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canShare, setCanShare] = useState(false)

  // Check Web Share API support on mount
  useEffect(() => {
    setCanShare(canShareFiles())
  }, [])

  // Load saved preferences on mount
  useEffect(() => {
    const saved = localStorage.getItem(PREFS_KEY)
    if (saved) {
      try {
        const { style, format } = JSON.parse(saved)
        if (style && style in TEMPLATE_STYLES) {
          setSelectedStyle(style as TemplateStyle)
          console.log('[Component] SharePageClient - Loaded saved style:', style)
        }
        if (format && format in TEMPLATE_FORMATS) {
          setSelectedFormat(format as TemplateFormat)
          console.log('[Component] SharePageClient - Loaded saved format:', format)
        }
      } catch (err) {
        console.error('[Component] SharePageClient - Failed to parse preferences:', err)
        // Invalid JSON, ignore and use defaults
      }
    }
  }, [])

  // Save preferences when they change
  const savePreferences = useCallback((style: TemplateStyle, format: TemplateFormat) => {
    try {
      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({
          style,
          format,
          timestamp: new Date().toISOString(),
        })
      )
      console.log('[Component] SharePageClient - Saved preferences:', { style, format })
    } catch (err) {
      console.error('[Component] SharePageClient - Failed to save preferences:', err)
      // localStorage might be disabled, fail gracefully
    }
  }, [])

  // Handle style change with persistence
  const handleStyleChange = useCallback((newStyle: TemplateStyle) => {
    setSelectedStyle(newStyle)
    savePreferences(newStyle, selectedFormat)
  }, [selectedFormat, savePreferences])

  // Handle format change with persistence
  const handleFormatChange = useCallback((newFormat: TemplateFormat) => {
    setSelectedFormat(newFormat)
    savePreferences(selectedStyle, newFormat)
  }, [selectedStyle, savePreferences])

  // Reset to defaults
  const handleReset = () => {
    setSelectedStyle('clean')
    setSelectedFormat('square')
    try {
      localStorage.removeItem(PREFS_KEY)
      console.log('[Component] SharePageClient - Reset to defaults')
    } catch (err) {
      console.error('[Component] SharePageClient - Failed to clear preferences:', err)
    }
  }

  // Download handler
  const handleDownload = useCallback(async () => {
    console.log('[Component] SharePageClient - Generate image:', {
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

      console.log('[Component] SharePageClient - Image downloaded successfully')
      toast.success('Image downloaded!')
    } catch (err: any) {
      console.error('[Component] SharePageClient - Generate error:', err)
      setError(err.message || 'Failed to generate image')
      toast.error('Failed to download image')
    } finally {
      setIsGenerating(false)
    }
  }, [itinerary.id, itinerary.slug, selectedStyle, selectedFormat])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Template shortcuts: 1, 2, 3
      if (e.key === '1') {
        handleStyleChange('clean')
        console.log('[Component] SharePageClient - Keyboard shortcut: Clean')
      }
      if (e.key === '2') {
        handleStyleChange('bold')
        console.log('[Component] SharePageClient - Keyboard shortcut: Bold')
      }
      if (e.key === '3') {
        handleStyleChange('minimal')
        console.log('[Component] SharePageClient - Keyboard shortcut: Minimal')
      }

      // Format shortcuts: S, Q, P
      const key = e.key.toLowerCase()
      if (key === 's' && !e.shiftKey) {
        handleFormatChange('story')
        console.log('[Component] SharePageClient - Keyboard shortcut: Story')
      }
      if (key === 'q') {
        handleFormatChange('square')
        console.log('[Component] SharePageClient - Keyboard shortcut: Square')
      }
      if (key === 'p') {
        handleFormatChange('portrait')
        console.log('[Component] SharePageClient - Keyboard shortcut: Portrait')
      }

      // Download shortcut: D
      if (key === 'd' && !isGenerating) {
        handleDownload()
        console.log('[Component] SharePageClient - Keyboard shortcut: Download')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isGenerating, handleStyleChange, handleFormatChange, handleDownload])

  console.log('[Component] SharePageClient - Render:', {
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

  const handleShare = useCallback(async () => {
    console.log('[Component] SharePageClient - Share image:', {
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

      const blob = await response.blob()

      // Attempt to share
      const shared = await shareImage(
        blob,
        itinerary.title,
        itinerary.slug,
        selectedFormat
      )

      if (shared) {
        console.log('[Component] SharePageClient - Share initiated')
      } else {
        // User cancelled or share not supported, fallback to download
        console.log('[Component] SharePageClient - Share cancelled, falling back to download')
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${itinerary.slug}-${selectedFormat}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success('Image downloaded!')
      }
    } catch (err: any) {
      console.error('[Component] SharePageClient - Share error:', err)
      setError(err.message || 'Failed to share image')
      toast.error('Failed to share image')
    } finally {
      setIsGenerating(false)
    }
  }, [itinerary.id, itinerary.title, itinerary.slug, selectedStyle, selectedFormat])

  return (
    <div className="min-h-screen bg-cream">
      {/* Slim Header - Navigation context only, actions in DownloadPanel */}
      <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-3">
          <div className="flex items-center justify-between">
            {/* Back + Title */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-1.5 text-neutral-600 hover:text-neutral-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>

              <div className="h-6 w-px bg-neutral-200 hidden sm:block" />

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="font-display text-lg font-bold text-neutral-900 tracking-tight">
                    Share Your Trip
                  </h1>
                  <p className="font-body text-xs text-neutral-500 truncate max-w-[200px] sm:max-w-none">
                    {itinerary.title}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 lg:px-12 py-6">
        {/* Error Message */}
        {error && (
          <div
            className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 animate-shake"
            role="alert"
          >
            <p className="text-xs text-red-800 font-body font-medium text-center">
              {error}
            </p>
          </div>
        )}

        {/* 3-Column Layout (Desktop) / Stacked (Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Sidebar - Template Selector */}
          <div className="lg:col-span-3 order-1">
            <div className="lg:sticky lg:top-20">
              <TemplateSelector
                selected={selectedStyle}
                onChange={handleStyleChange}
              />
            </div>
          </div>

          {/* Center - Preview Panel */}
          <div className="lg:col-span-6 order-3 lg:order-2">
            <PreviewPanel
              style={selectedStyle}
              format={selectedFormat}
              data={templateData}
            />
          </div>

          {/* Right Sidebar - Format Selector + Download */}
          <div className="lg:col-span-3 order-2 lg:order-3">
            <div className="lg:sticky lg:top-20 space-y-6">
              <FormatSelector
                selected={selectedFormat}
                onChange={handleFormatChange}
              />

              <div className="hidden lg:block">
                <DownloadPanel
                  tripTitle={itinerary.title}
                  destination={itinerary.destination || undefined}
                  dayCount={dayCount > 0 ? dayCount : undefined}
                  activityCount={activityCount > 0 ? activityCount : undefined}
                  format={selectedFormat}
                  isGenerating={isGenerating}
                  canShare={canShare}
                  onDownload={handleDownload}
                  onShare={handleShare}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Download Panel */}
        <div className="lg:hidden mt-6">
          <DownloadPanel
            tripTitle={itinerary.title}
            destination={itinerary.destination || undefined}
            dayCount={dayCount > 0 ? dayCount : undefined}
            activityCount={activityCount > 0 ? activityCount : undefined}
            format={selectedFormat}
            isGenerating={isGenerating}
            canShare={canShare}
            onDownload={handleDownload}
            onShare={handleShare}
          />
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-400 font-body">
            <span className="hidden sm:inline">
              Tip: Press <kbd className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 rounded text-neutral-600 font-mono">1-3</kbd> for styles,
              <kbd className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 rounded text-neutral-600 font-mono mx-1">S/Q/P</kbd> for formats,
              <kbd className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 rounded text-neutral-600 font-mono">D</kbd> to download
            </span>
          </p>
        </div>
      </main>
    </div>
  )
}
