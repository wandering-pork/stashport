'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { ItineraryWithDays } from '@/lib/types/models'
import { cn } from '@/lib/utils/cn'
import { MapPin, Calendar, Clock, Plane, Sparkles } from 'lucide-react'

// Format date for display
const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

// Format short date
const formatShortDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export default function PublicTripPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [trip, setTrip] = useState<ItineraryWithDays | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    const fetchTrip = async () => {
      try {
        const response = await fetch(`/api/itineraries/public/${slug}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError('Trip not found')
          } else if (response.status === 403) {
            setError('This trip is private')
          } else {
            setError('Failed to load trip')
          }
          setIsLoading(false)
          return
        }

        const data = await response.json()
        setTrip(data)
      } catch (err) {
        console.error('Error fetching trip:', err)
        setError('Failed to load trip')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrip()
  }, [slug])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Plane className="w-8 h-8 text-white" />
          </div>
          <p className="text-neutral-600 font-body">Loading your adventure...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-2xl mx-auto px-4 py-24">
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-3">
              {error === 'Trip not found' ? 'Trip Not Found' : error}
            </h1>
            <p className="text-neutral-600 font-body mb-8">
              {error === 'Trip not found'
                ? "This trip doesn't exist or may have been removed."
                : error === 'This trip is private'
                ? 'The creator has made this trip private.'
                : 'Something went wrong while loading this trip.'}
            </p>
            <Button
              variant="primary"
              onClick={() => window.location.href = '/'}
            >
              Explore Other Trips
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!trip) {
    return null
  }

  const dayCount = trip.days?.length || 0
  const activityCount = trip.days?.reduce((sum, day) => sum + (day.activities?.length || 0), 0) || 0

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      {trip.cover_photo_url ? (
        // Hero WITH cover photo - immersive full-width
        <div className="relative min-h-[70vh] lg:min-h-[80vh] overflow-hidden">
          {/* Background Image */}
          <img
            src={trip.cover_photo_url}
            alt={trip.title}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Gradient Overlay - cinematic feel */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

          {/* Decorative grain texture */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16">
            <div className="max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
              {/* Destination Badge - Glass morphism */}
              {trip.destination && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-md rounded-full border border-white/20 mb-6">
                  <MapPin className="w-4 h-4 text-white" />
                  <span className="text-white font-heading font-medium text-sm tracking-wide">
                    {trip.destination}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 data-testid="trip-title" className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-white mb-6 max-w-4xl leading-[1.1] tracking-tight">
                {trip.title}
              </h1>

              {/* Meta Info Row */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {dayCount > 0 && (
                  <span className="text-white/80 font-body text-sm md:text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {dayCount} {dayCount === 1 ? 'Day' : 'Days'}
                  </span>
                )}
                {activityCount > 0 && (
                  <span className="text-white/80 font-body text-sm md:text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {activityCount} {activityCount === 1 ? 'Activity' : 'Activities'}
                  </span>
                )}
                {trip.tags && trip.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {trip.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium border border-white/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Creator Row */}
              {trip.creator && (
                <div className="flex items-center gap-3" data-testid="creator">
                  <Avatar
                    name={trip.creator.display_name}
                    color={trip.creator.avatar_color}
                    size="md"
                    data-testid="creator-avatar"
                  />
                  <div>
                    <span className="text-white/60 text-sm font-body">Created by</span>
                    <p className="text-white font-heading font-semibold" data-testid="creator-name">
                      {trip.creator.display_name || 'Anonymous Traveler'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Hero WITHOUT cover photo - gradient background
        <div className="relative min-h-[50vh] lg:min-h-[60vh] overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600">
          {/* Pattern overlay for visual interest */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />

          {/* Decorative shapes */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-secondary-400/20 rounded-full blur-2xl" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16">
            <div className="max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
              {/* Destination Badge */}
              {trip.destination && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-6">
                  <MapPin className="w-4 h-4 text-white" />
                  <span className="text-white font-heading font-medium text-sm tracking-wide">
                    {trip.destination}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 data-testid="trip-title" className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 max-w-4xl leading-[1.1] tracking-tight">
                {trip.title}
              </h1>

              {/* Meta Info Row */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {dayCount > 0 && (
                  <span className="text-white/80 font-body text-sm md:text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {dayCount} {dayCount === 1 ? 'Day' : 'Days'}
                  </span>
                )}
                {activityCount > 0 && (
                  <span className="text-white/80 font-body text-sm md:text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {activityCount} {activityCount === 1 ? 'Activity' : 'Activities'}
                  </span>
                )}
                {trip.tags && trip.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {trip.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium border border-white/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Creator Row */}
              {trip.creator && (
                <div className="flex items-center gap-3" data-testid="creator">
                  <Avatar
                    name={trip.creator.display_name}
                    color={trip.creator.avatar_color}
                    size="md"
                    data-testid="creator-avatar"
                  />
                  <div>
                    <span className="text-white/60 text-sm font-body">Created by</span>
                    <p className="text-white font-heading font-semibold" data-testid="creator-name">
                      {trip.creator.display_name || 'Anonymous Traveler'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Description Section */}
      {trip.description && (
        <div className="bg-white border-b border-neutral-100">
          <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
            <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
              <h2 className="text-sm font-heading font-bold uppercase tracking-widest text-primary-600 mb-4">
                About This Trip
              </h2>
              <p className="text-lg md:text-xl text-neutral-700 font-body leading-relaxed">
                {trip.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Days/Itinerary Section */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
        {trip.days && trip.days.length > 0 ? (
          <div className="space-y-12 md:space-y-16">
            {trip.days.map((day, dayIndex) => (
              <div
                key={day.id}
                className="animate-fade-in"
                style={{ animationDelay: `${400 + dayIndex * 100}ms` }}
              >
                {/* Day Header */}
                <div className="flex items-start gap-4 md:gap-6 mb-6">
                  {/* Day Number Badge */}
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-display font-bold text-xl md:text-2xl shadow-lg shadow-primary-500/25">
                      {day.day_number}
                    </div>
                  </div>

                  {/* Day Info */}
                  <div className="flex-1 pt-1">
                    {day.date && (
                      <p className="text-sm font-heading font-semibold text-neutral-500 mb-1">
                        {formatDate(day.date)}
                      </p>
                    )}
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-neutral-900">
                      {day.title || `Day ${day.day_number}`}
                    </h2>
                  </div>
                </div>

                {/* Activities Timeline */}
                {day.activities && day.activities.length > 0 ? (
                  <div className="pl-7 md:pl-8 ml-7 md:ml-8 border-l-2 border-primary-200 space-y-4">
                    {day.activities.map((activity, actIndex) => (
                      <div
                        key={activity.id || actIndex}
                        className={cn(
                          'relative bg-white rounded-xl p-5 md:p-6',
                          'border border-neutral-200 shadow-sm',
                          'hover:shadow-md hover:border-neutral-300 transition-all duration-200',
                          'group'
                        )}
                      >
                        {/* Timeline dot */}
                        <div className="absolute -left-[calc(1.75rem+5px)] md:-left-[calc(2rem+5px)] top-6 w-2.5 h-2.5 rounded-full bg-primary-500 border-2 border-white shadow-sm" />

                        {/* Activity Content */}
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-50 to-secondary-100 border border-secondary-200 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-secondary-600" />
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-heading font-bold text-lg text-neutral-900 mb-1">
                              {activity.title}
                            </h3>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600">
                              {activity.location && (
                                <span className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                                  {activity.location}
                                </span>
                              )}
                              {activity.start_time && (
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                                  {activity.start_time.substring(0, 5)}
                                  {activity.end_time && ` - ${activity.end_time.substring(0, 5)}`}
                                </span>
                              )}
                            </div>

                            {activity.notes && (
                              <p className="mt-3 text-neutral-600 font-body leading-relaxed">
                                {activity.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pl-7 md:pl-8 ml-7 md:ml-8 border-l-2 border-neutral-200">
                    <p className="text-neutral-500 font-body italic py-4">
                      No activities planned for this day
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Empty state
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-6">
              <Plane className="w-10 h-10 text-neutral-400" />
            </div>
            <h2 className="text-2xl font-display font-bold text-neutral-900 mb-3">
              No Itinerary Yet
            </h2>
            <p className="text-neutral-600 font-body max-w-md mx-auto">
              The creator hasn't added any days or activities to this trip yet.
            </p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Inspired by this trip?
          </h2>
          <p className="text-white/80 font-body text-lg mb-8 max-w-xl mx-auto">
            Create your own adventure on Stashport.
          </p>
          <Button
            variant="secondary"
            onClick={() => window.location.href = '/itinerary/new'}
            className="bg-white text-primary-600 hover:bg-white/90 border-transparent"
          >
            Plan Your Own Trip
          </Button>
        </div>
      </div>
    </div>
  )
}
