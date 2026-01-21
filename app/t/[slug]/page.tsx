'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { TagPill } from '@/components/ui/tag-pill'
import { ShareModal } from '@/components/itinerary/share-modal'
import { ItineraryWithDays } from '@/lib/types/models'
import { MapPin, Calendar, Clock, Plane, Loader2, Share2 } from 'lucide-react'

export default function PublicTripPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [trip, setTrip] = useState<ItineraryWithDays | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    if (!slug) return

    const fetchTrip = async () => {
      try {
        // Get trip by slug - need to use API endpoint that searches by slug
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading trip...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-gray-600">Trip not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-neutral-900 mb-2">
                {trip.title}
              </h1>

              {/* Creator Attribution */}
              {trip.creator && (
                <div className="flex items-center gap-2 mb-3">
                  <Avatar
                    name={trip.creator.display_name}
                    color={trip.creator.avatar_color}
                    size="sm"
                  />
                  <span className="text-sm text-neutral-600">
                    Created by {trip.creator.display_name || 'Anonymous Traveler'}
                  </span>
                </div>
              )}

              {trip.destination && (
                <div className="flex items-center gap-2 text-neutral-600 mb-3">
                  <MapPin className="w-5 h-5 text-primary-500" />
                  <span>{trip.destination}</span>
                </div>
              )}

              {/* Tags */}
              {trip.tags && trip.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {trip.tags.map((tag) => (
                    <TagPill key={tag} tag={tag} size="md" />
                  ))}
                </div>
              )}

              {trip.description && (
                <p className="text-neutral-600 max-w-2xl">{trip.description}</p>
              )}
            </div>

            {/* Share Button */}
            <Button
              variant="primary"
              onClick={() => setShowShareModal(true)}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {trip.days && trip.days.length > 0 ? (
          <div className="space-y-8">
            {trip.days.map((day) => (
              <Card key={day.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900">
                        Day {day.day_number}
                      </h2>
                      {day.title && (
                        <p className="text-neutral-600 mt-1">{day.title}</p>
                      )}
                      {day.date && (
                        <p className="flex items-center gap-2 text-sm text-neutral-500 mt-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(day.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {day.activities && day.activities.length > 0 && (
                  <CardContent>
                    <div className="space-y-4">
                      {day.activities.map((activity, idx) => (
                        <div
                          key={activity.id || idx}
                          className="border rounded-lg p-4 bg-gray-50"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-neutral-900">
                                {activity.title}
                              </h3>

                              {activity.location && (
                                <p className="flex items-center gap-2 text-sm text-neutral-600 mt-1">
                                  <MapPin className="w-4 h-4" />
                                  {activity.location}
                                </p>
                              )}

                              {(activity.start_time || activity.end_time) && (
                                <p className="flex items-center gap-2 text-sm text-neutral-600 mt-1">
                                  <Clock className="w-4 h-4" />
                                  {activity.start_time &&
                                    activity.start_time.substring(0, 5)}
                                  {activity.start_time && activity.end_time && ' - '}
                                  {activity.end_time &&
                                    activity.end_time.substring(0, 5)}
                                </p>
                              )}

                              {activity.notes && (
                                <p className="text-sm text-neutral-600 mt-3">
                                  {activity.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}

                {!day.activities || day.activities.length === 0 && (
                  <CardContent>
                    <p className="text-center text-neutral-500 py-4">
                      No activities planned for this day
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Plane className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">
                No days added to this trip yet
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        itinerary={trip}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  )
}
