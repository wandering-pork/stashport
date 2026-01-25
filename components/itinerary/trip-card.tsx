'use client'

import { useRouter } from 'next/navigation'
import { format, differenceInDays, isPast, isToday, isTomorrow } from 'date-fns'
import { toast } from 'sonner'
import { ItineraryWithDays } from '@/lib/types/models'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TagPill } from '@/components/ui/tag-pill'
import { Calendar, MapPin, Activity, Globe, Lock, Eye, Edit2, Link2, Trash2, DollarSign, Share2, Heart } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface TripCardProps {
  trip: ItineraryWithDays
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

export function TripCard({
  trip,
  onView,
  onEdit,
  onDelete,
}: TripCardProps) {
  const router = useRouter()
  const totalActivities = trip.days.reduce((acc, day) => acc + day.activities.length, 0)
  const dayCount = trip.days.length

  // Calculate date range from days
  const datesWithValues = trip.days.filter(day => day.date).map(day => new Date(day.date!))
  const hasDateRange = datesWithValues.length > 0 && trip.type === 'daily'
  const dateRangeText = hasDateRange
    ? datesWithValues.length === 1
      ? format(datesWithValues[0], 'MMM d')
      : `${format(datesWithValues[0], 'MMM d')} - ${format(datesWithValues[datesWithValues.length - 1], 'MMM d')}`
    : null

  // Calculate days until trip for countdown badge
  const startDate = datesWithValues.length > 0 ? datesWithValues[0] : null
  const getDaysUntilBadge = () => {
    if (!startDate || trip.type !== 'daily') return null

    const now = new Date()

    // Don't show for past trips (unless it's today)
    if (isPast(startDate) && !isToday(startDate)) return null

    if (isToday(startDate)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-accent-100 text-accent-700 rounded-full animate-pulse">
          Today!
        </span>
      )
    }

    if (isTomorrow(startDate)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-accent-100 text-accent-700 rounded-full">
          Tomorrow
        </span>
      )
    }

    const daysUntil = differenceInDays(startDate, now)
    if (daysUntil > 0 && daysUntil <= 30) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
          {daysUntil} day{daysUntil === 1 ? '' : 's'} away
        </span>
      )
    }

    return null
  }

  // Handle copy link to clipboard
  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation()

    const tripUrl = trip.is_public
      ? `${window.location.origin}/t/${trip.slug}`
      : `${window.location.origin}/itinerary/${trip.id}/edit`

    try {
      await navigator.clipboard.writeText(tripUrl)
      toast.success('Link copied to clipboard!')
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = tripUrl
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()

      try {
        document.execCommand('copy')
        toast.success('Link copied to clipboard!')
      } catch (fallbackErr) {
        toast.error('Failed to copy link')
      }

      document.body.removeChild(textArea)
    }
  }

  return (
    <Card
      variant="interactive"
      className="group overflow-hidden"
      onClick={onView}
    >
      {/* Cover Photo / Gradient Header */}
      <div className="h-32 relative overflow-hidden">
        {trip.cover_photo_url ? (
          <>
            {/* Cover Photo */}
            <img
              src={trip.cover_photo_url}
              alt={`${trip.title} cover`}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlay for better badge visibility */}
            <div className="absolute inset-0 bg-black/10" />
          </>
        ) : (
          /* Gradient Background */
          <div
            className={cn(
              'absolute inset-0',
              trip.is_public
                ? 'bg-gradient-to-br from-primary-400 to-secondary-400'
                : 'bg-gradient-to-br from-neutral-300 to-neutral-400'
            )}
          />
        )}
        {/* Destination & Type Badges */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          {trip.destination && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-sm">
              <MapPin className="w-4 h-4 text-neutral-600" />
              <span className="text-xs font-semibold text-neutral-700">
                {trip.destination}
              </span>
            </div>
          )}

          {/* Trip Type Badge */}
          {trip.type === 'daily' ? (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-secondary-100/95 backdrop-blur-sm text-secondary-700 rounded-full shadow-sm">
              <Calendar className="w-3 h-3" />
              <span className="text-xs font-semibold">Daily</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-primary-100/95 backdrop-blur-sm text-primary-700 rounded-full shadow-sm">
              <Heart className="w-3 h-3" />
              <span className="text-xs font-semibold">Guide</span>
            </div>
          )}
        </div>

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

        {/* Days Until Trip Badge */}
        {getDaysUntilBadge() && (
          <div className="mb-3">
            {getDaysUntilBadge()}
          </div>
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
              <span className="text-xs text-neutral-500">
                {hasDateRange ? 'Dates' : 'Days'}
              </span>
              <span className="text-sm font-semibold text-neutral-900">
                {hasDateRange ? dateRangeText : dayCount}
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
              onClick={handleCopyLink}
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
                router.push(`/itinerary/${trip.id}/share`)
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
