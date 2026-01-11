'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { TripCard } from '@/components/itinerary/trip-card'
import { ItineraryWithDays } from '@/lib/types/models'
import { MapPin, Plane, Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [itineraries, setItineraries] = useState<ItineraryWithDays[]>([])
  const [toDelete, setToDelete] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch itineraries on mount
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/auth/login')
      return
    }

    const fetchItineraries = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/itineraries')

        if (!response.ok) {
          throw new Error('Failed to fetch itineraries')
        }

        const data = await response.json()
        setItineraries(data || [])
      } catch (err) {
        console.error('Error fetching itineraries:', err)
        setError('Failed to load your trips')
      } finally {
        setIsLoading(false)
      }
    }

    fetchItineraries()
  }, [user, authLoading, router])

  const publicTrips = itineraries.filter(it => it.is_public)
  const privateTrips = itineraries.filter(it => !it.is_public)

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/itineraries/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete itinerary')
      }

      setItineraries(itineraries.filter((it) => it.id !== id))
      setToDelete(null)
    } catch (err) {
      console.error('Error deleting itinerary:', err)
      setError('Failed to delete trip')
    }
  }

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your trips...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Try again
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 flex items-center gap-3 mb-2">
                <Plane className="w-8 h-8 text-primary-500" />
                My Trips
              </h1>
              <p className="text-neutral-600">Manage and share your travel itineraries</p>
            </div>
            <Button
              size="lg"
              onClick={() => router.push('/itinerary/new')}
              className="gap-2"
            >
              <Plane className="w-5 h-5" />
              Create Trip
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <Card variant="featured">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Total Trips</p>
                  <p className="text-3xl font-bold text-neutral-900">
                    {itineraries.length}
                  </p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100">
                  <Plane className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="featured">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Public Trips</p>
                  <p className="text-3xl font-bold text-secondary-900">
                    {publicTrips.length}
                  </p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary-100">
                  <MapPin className="w-6 h-6 text-secondary-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="featured">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Private Trips</p>
                  <p className="text-3xl font-bold text-accent-900">
                    {privateTrips.length}
                  </p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent-100">
                  <Plane className="w-6 h-6 text-accent-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Public Trips Section */}
        {publicTrips.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Public Trips</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onView={() => router.push(`/t/${trip.slug}`)}
                  onEdit={() => router.push(`/itinerary/${trip.id}/edit`)}
                  onCopyLink={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/t/${trip.slug}`
                    )
                  }}
                  onDelete={() => setToDelete(trip.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Private Trips Section */}
        {privateTrips.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Private Trips</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {privateTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onView={() => router.push(`/itinerary/${trip.id}/edit`)}
                  onEdit={() => router.push(`/itinerary/${trip.id}/edit`)}
                  onCopyLink={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/itinerary/${trip.id}/edit`
                    )
                  }}
                  onDelete={() => setToDelete(trip.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {itineraries.length === 0 && (
          <Card variant="featured" className="text-center py-16">
            <CardContent className="pt-0">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-100">
                  <Plane className="w-8 h-8 text-primary-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                No trips yet
              </h3>
              <p className="text-neutral-600 mb-6 max-w-sm mx-auto">
                Start planning your next adventure by creating your first trip
              </p>
              <Button
                size="lg"
                onClick={() => router.push('/itinerary/new')}
              >
                Create Your First Trip
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {toDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <h2 className="text-lg font-semibold text-neutral-900">
                Delete Trip?
              </h2>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600">
                Are you sure you want to delete this trip? This action cannot be
                undone and will remove all associated days and activities.
              </p>
            </CardContent>
            <div className="px-6 py-4 border-t border-neutral-200 flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => setToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDelete(toDelete)
                }}
              >
                Delete Trip
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
