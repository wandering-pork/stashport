'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, StatCard } from '@/components/ui/card'
import { TripCard } from '@/components/itinerary/trip-card'
import { ItineraryWithDays } from '@/lib/types/models'
import { MapPin, Plane, Loader2, Globe, Lock, Plus, Compass, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

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
      <div className="min-h-screen bg-mesh-editorial grain-overlay flex items-center justify-center">
        <div className="text-center animate-reveal-up">
          <div className="relative mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center mx-auto shadow-coral">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
          </div>
          <h2 className="text-2xl font-display font-bold text-neutral-900 mb-2">Loading your journeys</h2>
          <p className="text-neutral-600 font-body">Preparing your adventures...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-mesh-editorial grain-overlay">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <Card variant="elevated" className="border-2 border-error animate-reveal-up">
            <CardContent padding="relaxed" className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">😕</span>
              </div>
              <h2 className="text-2xl font-display font-bold text-neutral-900 mb-3">{error}</h2>
              <p className="text-neutral-600 font-body mb-6">Something went wrong while loading your trips.</p>
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
                className="shadow-coral"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mesh-editorial grain-overlay">
      {/* Header Section - Editorial Style */}
      <div className="relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 shape-blob opacity-10 -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary-200 shape-blob-alt opacity-10 -ml-40 -mb-40" />

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-12 pb-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            {/* Title */}
            <div className="lg:col-span-7 animate-reveal-up">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-primary-600 mb-4 block">
                Dashboard
              </span>
              <h1 className="text-editorial-display text-5xl lg:text-6xl xl:text-7xl text-neutral-900 mb-4">
                Your
                <br />
                <span className="text-gradient-vibrant">Journeys</span>
              </h1>
              <p className="text-lg text-neutral-600 font-body max-w-md">
                {itineraries.length === 0
                  ? 'Start planning your first adventure'
                  : `Managing ${itineraries.length} ${itineraries.length === 1 ? 'adventure' : 'adventures'} across the world`
                }
              </p>
            </div>

            {/* Create Button */}
            <div className="lg:col-span-5 lg:text-right animate-reveal-up stagger-2">
              <Button
                size="lg"
                onClick={() => router.push('/itinerary/new')}
                className="font-heading font-bold shadow-coral hover:shadow-coral-lg"
              >
                <Plus className="w-5 h-5" />
                Create New Trip
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-reveal-up stagger-3">
          <StatCard
            label="Total Trips"
            value={itineraries.length}
            icon={<Plane className="w-7 h-7" />}
            accentColor="primary"
          />
          <StatCard
            label="Shared Adventures"
            value={publicTrips.length}
            icon={<Globe className="w-7 h-7" />}
            accentColor="secondary"
          />
          <StatCard
            label="Private Collection"
            value={privateTrips.length}
            icon={<Lock className="w-7 h-7" />}
            accentColor="accent"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
        {/* Public Trips Section */}
        {publicTrips.length > 0 && (
          <section className="mb-16 animate-reveal-up stagger-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-100 to-secondary-50 flex items-center justify-center shadow-teal">
                    <Globe className="w-5 h-5 text-secondary-600" />
                  </div>
                  <h2 className="text-editorial-headline text-3xl lg:text-4xl text-neutral-900">
                    Shared Adventures
                  </h2>
                </div>
                <p className="text-neutral-600 font-body ml-13">
                  {publicTrips.length} {publicTrips.length === 1 ? 'trip' : 'trips'} shared with the world
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicTrips.map((trip, i) => (
                <div
                  key={trip.id}
                  className="animate-reveal-up"
                  style={{ animationDelay: `${i * 75}ms` }}
                >
                  <TripCard
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
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Private Trips Section */}
        {privateTrips.length > 0 && (
          <section className="mb-16 animate-reveal-up stagger-5">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-100 to-accent-50 flex items-center justify-center shadow-golden">
                    <Lock className="w-5 h-5 text-accent-600" />
                  </div>
                  <h2 className="text-editorial-headline text-3xl lg:text-4xl text-neutral-900">
                    Personal Collection
                  </h2>
                </div>
                <p className="text-neutral-600 font-body ml-13">
                  {privateTrips.length} private {privateTrips.length === 1 ? 'trip' : 'trips'} & drafts
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {privateTrips.map((trip, i) => (
                <div
                  key={trip.id}
                  className="animate-reveal-up"
                  style={{ animationDelay: `${i * 75}ms` }}
                >
                  <TripCard
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
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {itineraries.length === 0 && (
          <div className="animate-reveal-up">
            <Card variant="editorial" className="relative overflow-hidden">
              {/* Decorative Pattern */}
              <div className="absolute inset-0 pattern-dots opacity-20" />

              <CardContent padding="none" className="relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  {/* Left - Content */}
                  <div className="p-10 lg:p-16">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center mb-8 shadow-coral">
                      <Compass className="w-10 h-10 text-primary-600" />
                    </div>

                    <h2 className="text-editorial-headline text-4xl lg:text-5xl text-neutral-900 mb-4">
                      Your adventure
                      <br />
                      <span className="text-gradient-vibrant">awaits</span>
                    </h2>

                    <p className="text-lg text-neutral-600 font-body mb-8 max-w-md">
                      Start planning your first journey. Create beautiful day-by-day itineraries and share your adventures with the world.
                    </p>

                    <Button
                      size="lg"
                      onClick={() => router.push('/itinerary/new')}
                      className="font-heading font-bold shadow-coral hover:shadow-coral-lg"
                    >
                      Create Your First Trip
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>

                  {/* Right - Visual */}
                  <div className="hidden lg:block relative h-full min-h-[400px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-l-3xl">
                      <div className="absolute inset-0 pattern-diagonal opacity-10" />
                      <div className="absolute inset-0 grain-overlay opacity-30" />

                      {/* Floating Elements */}
                      <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm animate-float" />
                      <div className="absolute bottom-1/3 right-1/4 w-12 h-12 bg-white/15 rounded-xl backdrop-blur-sm animate-float" style={{ animationDelay: '1s' }} />
                      <div className="absolute top-1/2 right-1/3 w-8 h-8 bg-white/10 rounded-lg backdrop-blur-sm animate-float" style={{ animationDelay: '2s' }} />

                      {/* Center Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-6xl">✈️</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {toDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <Card variant="elevated" className="w-full max-w-md animate-reveal-scale shadow-dramatic-lg">
            <CardHeader withDivider={false} size="relaxed">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <span className="text-2xl">🗑️</span>
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-neutral-900">
                    Delete Trip?
                  </h2>
                  <p className="text-sm text-neutral-500 font-body">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600 font-body">
                Are you sure you want to delete this trip? All associated days and activities will be permanently removed.
              </p>
            </CardContent>
            <div className="px-6 py-4 border-t border-neutral-200 flex gap-3 justify-end">
              <Button
                variant="tertiary"
                onClick={() => setToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(toDelete)}
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
