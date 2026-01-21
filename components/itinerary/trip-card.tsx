'use client'

import { useState } from 'react'
import { ItineraryWithDays } from '@/lib/types/models'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TagPill } from '@/components/ui/tag-pill'
import { ShareModal } from './share-modal'
import { Calendar, MapPin, Activity, Globe, Lock, Eye, Edit2, Link2, Trash2, DollarSign, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface TripCardProps {
  trip: ItineraryWithDays
  onView: () => void
  onEdit: () => void
  onCopyLink: () => void
  onDelete: () => void
}

export function TripCard({
  trip,
  onView,
  onEdit,
  onCopyLink,
  onDelete,
}: TripCardProps) {
  const [showShareModal, setShowShareModal] = useState(false)
  const totalActivities = trip.days.reduce((acc, day) => acc + day.activities.length, 0)
  const dayCount = trip.days.length

  return (
    <Card
      variant="interactive"
      className="group overflow-hidden"
      onClick={onView}
    >
      {/* Gradient Header */}
      <div
        className={cn(
          'h-32 relative overflow-hidden',
          trip.is_public
            ? 'bg-gradient-to-br from-primary-400 to-secondary-400'
            : 'bg-gradient-to-br from-neutral-300 to-neutral-400'
        )}
      >
        {/* Destination Badge */}
        {trip.destination && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-sm">
            <MapPin className="w-4 h-4 text-neutral-600" />
            <span className="text-xs font-semibold text-neutral-700">
              {trip.destination}
            </span>
          </div>
        )}

        {/* Public/Private Badge */}
        <div
          className={cn(
            'absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
            trip.is_public
              ? 'bg-green-100 text-green-700'
              : 'bg-neutral-600 text-white'
          )}
        >
          {trip.is_public ? (
            <>
              <Globe className="w-3 h-3" />
              <span>Public</span>
            </>
          ) : (
            <>
              <Lock className="w-3 h-3" />
              <span>Private</span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title & Description */}
        <h3 className="font-semibold text-lg text-neutral-900 truncate mb-1">
          {trip.title}
        </h3>

        {trip.description && (
          <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
            {trip.description}
          </p>
        )}

        {/* Tags */}
        {trip.tags && trip.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {trip.tags.slice(0, 3).map((tag) => (
              <TagPill key={tag} tag={tag} size="sm" />
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary-50">
              <Calendar className="w-4 h-4 text-primary-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-neutral-500">Days</span>
              <span className="text-sm font-semibold text-neutral-900">
                {dayCount}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-secondary-50">
              <Activity className="w-4 h-4 text-secondary-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-neutral-500">Activities</span>
              <span className="text-sm font-semibold text-neutral-900">
                {totalActivities}
              </span>
            </div>
          </div>

          {trip.budget_level && (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent-50">
                <DollarSign className="w-4 h-4 text-accent-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-neutral-500">Budget</span>
                <span className="text-sm font-semibold text-neutral-900">
                  {'$'.repeat(trip.budget_level)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer with date and actions */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            {formatDate(trip.updated_at)}
          </span>

          {/* Action Buttons - Hidden by default, shown on hover */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onView}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              title="View trip"
              aria-label="View trip"
            >
              <Eye className="w-4 h-4 text-neutral-600" />
            </button>
            <button
              onClick={onEdit}
              className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
              title="Edit trip"
              aria-label="Edit trip"
            >
              <Edit2 className="w-4 h-4 text-primary-600" />
            </button>
            <button
              onClick={onCopyLink}
              className="p-2 hover:bg-secondary-50 rounded-lg transition-colors"
              title="Copy link"
              aria-label="Copy share link"
            >
              <Link2 className="w-4 h-4 text-secondary-600" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowShareModal(true)
              }}
              className="p-2 hover:bg-accent-50 rounded-lg transition-colors"
              title="Share as image"
              aria-label="Share trip as image"
            >
              <Share2 className="w-4 h-4 text-accent-600" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete trip"
              aria-label="Delete trip"
            >
              <Trash2 className="w-4 h-4 text-error" />
            </button>
          </div>
        </div>
      </div>
      <ShareModal
        itinerary={trip}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </Card>
  )
}

/**
 * Format date to relative time (e.g., "Updated 2 hours ago")
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}
