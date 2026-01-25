'use client'

import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { Download, Calendar, MapPin, List, Share2 } from 'lucide-react'
import { TemplateFormat } from '@/lib/constants/templates'

interface DownloadPanelProps {
  tripTitle: string
  destination?: string
  dayCount?: number
  activityCount?: number
  format: TemplateFormat
  isGenerating: boolean
  canShare: boolean
  onDownload: () => void
  onShare?: () => void
}

/**
 * Get estimated file size based on format
 */
function getEstimatedFileSize(format: TemplateFormat): string {
  const sizes: Record<TemplateFormat, string> = {
    story: '~300KB',
    square: '~200KB',
    portrait: '~250KB',
  }
  return sizes[format]
}

export function DownloadPanel({
  tripTitle,
  destination,
  dayCount,
  activityCount,
  format,
  isGenerating,
  canShare,
  onDownload,
  onShare,
}: DownloadPanelProps) {
  return (
    <div className="space-y-4">
      {/* Trip Summary Card */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-50 to-white border-2 border-neutral-200 space-y-3">
        <h4 className="font-display text-sm font-bold text-neutral-900">
          Trip Summary
        </h4>

        <div className="space-y-2">
          {/* Title */}
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-3.5 h-3.5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body text-[10px] text-neutral-500 uppercase tracking-wide mb-0.5">
                Destination
              </p>
              <p className="font-heading font-semibold text-sm text-neutral-900 truncate">
                {destination || tripTitle}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          {(dayCount || activityCount) && (
            <div className="grid grid-cols-2 gap-2">
              {dayCount !== undefined && dayCount > 0 && (
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-secondary-50 border border-secondary-200">
                  <Calendar className="w-3 h-3 text-secondary-600 flex-shrink-0" />
                  <div>
                    <p className="font-heading font-bold text-base text-neutral-900">
                      {dayCount}
                    </p>
                    <p className="font-body text-[10px] text-neutral-600">
                      {dayCount === 1 ? 'Day' : 'Days'}
                    </p>
                  </div>
                </div>
              )}

              {activityCount !== undefined && activityCount > 0 && (
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-accent-50 border border-accent-200">
                  <List className="w-3 h-3 text-accent-600 flex-shrink-0" />
                  <div>
                    <p className="font-heading font-bold text-base text-neutral-900">
                      {activityCount}
                    </p>
                    <p className="font-body text-[10px] text-neutral-600">
                      {activityCount === 1 ? 'Activity' : 'Activities'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Download Section */}
      <div className="space-y-3">
        <div className="space-y-1">
          <h4 className="font-display text-sm font-bold text-neutral-900">
            Ready to Share
          </h4>
          <p className="font-body text-xs text-neutral-500">
            High-resolution PNG • {getEstimatedFileSize(format)}
          </p>
        </div>

        <div className="space-y-2">
          {/* Share Button (if supported) */}
          {canShare && onShare && (
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={onShare}
              isLoading={isGenerating}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share Image
            </Button>
          )}

          {/* Download Button */}
          <Button
            variant={canShare ? "ghost" : "primary"}
            size="md"
            fullWidth
            onClick={onDownload}
            isLoading={isGenerating}
            className={cn(
              "gap-2",
              !canShare && "shadow-md shadow-primary-200/50 hover:shadow-lg hover:shadow-primary-300/50",
              "transition-all duration-300"
            )}
          >
            <Download className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Download Image'}
          </Button>
        </div>
      </div>
    </div>
  )
}
