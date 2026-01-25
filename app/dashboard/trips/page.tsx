'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TripCard } from '@/components/itinerary/trip-card'
import { ItineraryWithDays } from '@/lib/types/models'
import {
  Loader2,
  Plus,
  ArrowLeft,
  Compass,
  Filter,
  SortAsc,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export default function MyTripsPage() {
  return (
    <Suspense fallback={<TripsLoading />}>
      <TripsContent />
    </Suspense>
  )
}

function TripsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh-editorial">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center shadow-lg">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
        <p className="text-neutral-500 font-body">Loading your trips...</p>
      </div>
    </div>
  )
}

function TripsContent() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [itineraries, setItineraries] = useState<ItineraryWithDays[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'daily' | 'guide'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical'>('recent')

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/auth/login')
      return
    }

    const fetchTrips = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/itineraries')
        if (!response.ok) throw new Error('Failed to fetch trips')
        const trips = await response.json()
        setItineraries(trips || [])
      } catch (err) {
        console.error('Error fetching trips:', err)
        setError('Failed to load your trips')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrips()
  }, [user, authLoading, router])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/itineraries/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete trip')
      setItineraries(itineraries.filter((it) => it.id !== id))
      setToDelete(null)
    } catch (err) {
      console.error('Error deleting trip:', err)
      setError('Failed to delete trip')
    }
  }

  // Filter and sort
  const filteredTrips = itineraries
    .filter((trip) => filterType === 'all' || trip.type === filterType)
    .sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title)
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })

  if (authLoading || isLoading) {
    return <TripsLoading />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-mesh-editorial">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <Card variant="elevated" className="border-2 border-error animate-reveal-up">
            <CardContent padding="relaxed" className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">😕</span>
              </div>
              <h2 className="text-2xl font-display font-bold text-neutral-900 mb-3">{error}</h2>
              <p className="text-neutral-600 font-body mb-6">
                Something went wrong while loading your trips.
              </p>
              <Button variant="primary" onClick={() => window.location.reload()} className="shadow-coral">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mesh-editorial">
      {/* Header Section */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-8 pb-6">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </Link>
          <div>
            <h1 className="text-editorial-headline text-3xl lg:text-4xl text-neutral-900">
              My Trips
            </h1>
            <p className="text-neutral-500 font-body mt-1">
              {itineraries.length} {itineraries.length === 1 ? 'trip' : 'trips'} total
            </p>
          </div>
        </div>

        {/* Filters & Sort */}
        {itineraries.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-neutral-400" />
              <div className="flex rounded-lg border border-neutral-200 overflow-hidden">
                {(['all', 'daily', 'guide'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-heading font-bold uppercase',
                      'transition-colors duration-200',
                      filterType === type
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-neutral-600 hover:bg-neutral-50'
                    )}
                  >
                    {type === 'all' ? 'All' : type === 'daily' ? 'Trips' : 'Guides'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <SortAsc className="w-4 h-4 text-neutral-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'alphabetical')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-heading font-bold',
                  'bg-white border border-neutral-200 text-neutral-600',
                  'focus:outline-none focus:border-primary-400'
                )}
              >
                <option value="recent">Most Recent</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>

            {/* Create Button */}
            <div className="ml-auto">
              <Button onClick={() => router.push('/itinerary/new')} className="shadow-coral">
                <Plus className="w-4 h-4 mr-2" />
                New Trip
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Trips Grid */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 pb-16">
        {filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTrips.map((trip, index) => (
              <div key={trip.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-reveal-up">
                <TripCard
                  trip={trip}
                  onView={() => router.push(`/t/${trip.slug}`)}
                  onEdit={() => router.push(`/itinerary/${trip.id}/edit`)}
                  onDelete={() => setToDelete(trip.id)}
                />
              </div>
            ))}
          </div>
        ) : itineraries.length > 0 ? (
          /* No results after filtering */
          <Card variant="default" className="text-center py-12">
            <CardContent>
              <p className="text-neutral-500 font-body">
                No {filterType === 'daily' ? 'trips' : filterType === 'guide' ? 'guides' : 'items'} found.
              </p>
              <Button variant="tertiary" onClick={() => setFilterType('all')} className="mt-4">
                Show All
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Empty State */
          <Card variant="interactive" className="border-2 border-dashed border-neutral-200">
            <CardContent padding="relaxed" className="text-center py-16">
              <div className="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-6">
                <Compass className="w-10 h-10 text-primary-500" />
              </div>
              <h3 className="font-display font-bold text-2xl text-neutral-900 mb-3">
                No trips yet
              </h3>
              <p className="text-neutral-600 font-body mb-8 max-w-sm mx-auto">
                Start planning your next adventure and share your journey with the world.
              </p>
              <Button size="lg" onClick={() => router.push('/itinerary/new')} className="shadow-coral">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Trip
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      {toDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <Card variant="elevated" className="w-full max-w-md animate-reveal-scale shadow-dramatic-lg">
            <CardContent padding="relaxed">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <span className="text-2xl">🗑️</span>
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-neutral-900">Delete Trip?</h2>
                  <p className="text-sm text-neutral-500 font-body">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-neutral-600 font-body mb-6">
                Are you sure you want to delete this trip? All associated days and activities will be permanently removed.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="tertiary" onClick={() => setToDelete(null)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={() => handleDelete(toDelete)}>
                  Delete Trip
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
