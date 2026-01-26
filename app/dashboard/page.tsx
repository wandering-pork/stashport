'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, Suspense, useMemo } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { ItineraryWithDays } from '@/lib/types/models'
import { ExploreItinerary } from '@/components/itinerary/explore-card'
import {
  MapPin,
  Loader2,
  Plus,
  ArrowRight,
  Calendar,
  Heart,
  Sparkles,
  Lock,
  Bookmark,
  ChevronRight,
  Compass,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { format, differenceInDays, isFuture, isToday, isTomorrow } from 'date-fns'

// Wrapper component to handle Suspense boundary for useSearchParams
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  )
}

// Loading fallback component
function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-color-surface via-cream to-color-surface">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center shadow-lg">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
        <p className="text-neutral-500 font-body">Loading your adventures...</p>
      </div>
    </div>
  )
}

function DashboardContent() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  const [itineraries, setItineraries] = useState<ItineraryWithDays[]>([])
  const [suggestions, setSuggestions] = useState<ExploreItinerary[]>([])
  const [toDelete, setToDelete] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user's itineraries
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/auth/login')
      return
    }

    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch user's trips with reasonable limit for dashboard view
        // Dashboard only shows 2 trips, but fetch more for filtering upcoming vs recent
        const response = await fetch('/api/itineraries?limit=20')
        if (!response.ok) throw new Error('Failed to fetch itineraries')
        const trips = await response.json()
        setItineraries(trips || [])

        // Fetch personalized suggestions
        await fetchSuggestions(trips || [])
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load your trips')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, authLoading, router])

  // Fetch personalized suggestions based on user's tags and destinations
  const fetchSuggestions = async (userTrips: ItineraryWithDays[]) => {
    try {
      // Extract user's tags and destinations for personalization
      const userTags = new Set<string>()
      const userDestinations = new Set<string>()

      userTrips.forEach((trip) => {
        trip.tags?.forEach((tag) => userTags.add(tag))
        if (trip.destination) userDestinations.add(trip.destination)
      })

      // Build query params for personalized results
      const params = new URLSearchParams({ limit: '6' })
      if (userTags.size > 0) {
        params.set('tags', Array.from(userTags).slice(0, 3).join(','))
      }

      const response = await fetch(`/api/itineraries/explore?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.itineraries?.slice(0, 3) || [])
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err)
      // Silently fail - suggestions are optional
    }
  }

  // Smart hybrid: Get upcoming trips first, fallback to recent
  // Optimized to pre-compute start dates instead of recalculating during sort
  const { displayTrips, hasUpcoming } = useMemo(() => {
    // Pre-compute start dates for all trips to avoid repeated calculations
    const tripsWithDates = itineraries.map((trip) => {
      let startDate: Date | null = null
      if (trip.type === 'daily' && trip.days.length > 0) {
        const datesWithValues = trip.days.filter((d) => d.date)
        if (datesWithValues.length > 0) {
          startDate = new Date(datesWithValues[0].date!)
        }
      }
      return { trip, startDate }
    })

    // Filter for upcoming trips (future or today)
    const upcoming = tripsWithDates
      .filter(({ trip, startDate }) => {
        if (trip.type !== 'daily' || !startDate) return false
        return isFuture(startDate) || isToday(startDate)
      })
      .sort((a, b) => {
        // Use pre-computed dates
        return (a.startDate?.getTime() || 0) - (b.startDate?.getTime() || 0)
      })
      .map(({ trip }) => trip)

    // If we have upcoming trips, return those
    if (upcoming.length >= 2) {
      return { displayTrips: upcoming.slice(0, 2), hasUpcoming: true }
    }
    if (upcoming.length === 1) {
      // Mix with most recent (non-upcoming)
      const recent = itineraries
        .filter((t) => !upcoming.includes(t))
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      return { displayTrips: [...upcoming, ...recent.slice(0, 1)], hasUpcoming: true }
    }

    // Fallback: most recent trips (no upcoming)
    const recentTrips = itineraries
      .slice()
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 2)
    return { displayTrips: recentTrips, hasUpcoming: false }
  }, [itineraries])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/itineraries/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete itinerary')
      setItineraries(itineraries.filter((it) => it.id !== id))
      setToDelete(null)
    } catch (err) {
      console.error('Error deleting itinerary:', err)
      setError('Failed to delete trip')
    }
  }

  // Get user's display name - prefer profile display_name, fallback to email username
  const getDisplayName = () => {
    if (profile?.display_name) {
      return profile.display_name
    }
    const emailUsername = user?.email?.split('@')[0] || 'Traveler'
    return emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1)
  }
  const displayName = getDisplayName()

  // Show loading state
  if (authLoading || isLoading) {
    return <DashboardLoading />
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
      {/* ============================================
          HERO SECTION - Wave Background
          ============================================ */}
      <section className="relative overflow-hidden">
        {/* Wave Background */}
        <div className="absolute inset-0 bg-wave-warm opacity-60" />

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary-200/30 to-transparent rounded-full -mr-64 -mt-64 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-secondary-200/20 to-transparent rounded-full -ml-48 -mb-48 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 pt-12 lg:pt-16 pb-16 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: Greeting */}
            <div className="animate-reveal-up">
              <h1 className="text-editorial-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-neutral-900 mb-4">
                Hi {displayName},
                <br />
                Ready for Your
                <br />
                <span className="text-gradient-vibrant">Next Adventure?</span>
              </h1>
              <p className="text-lg lg:text-xl text-neutral-600 font-body max-w-lg mb-8">
                Plan, organize, and share your travel journeys seamlessly.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => router.push('/itinerary/new')}
                  className="font-heading font-bold shadow-coral hover:shadow-coral-lg group"
                >
                  <Plus className="w-5 h-5 mr-2 transition-transform group-hover:rotate-90" />
                  Plan New Trip
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => router.push('/explore')}
                  className="font-heading font-bold"
                >
                  <Compass className="w-5 h-5 mr-2" />
                  Browse Ideas
                </Button>
              </div>
            </div>

            {/* Right: Decorative Visual */}
            <div className="hidden lg:flex justify-end animate-reveal-up stagger-2">
              <div className="relative">
                {/* Floating Cards Preview */}
                <div className="relative w-80 h-64">
                  {/* Back card */}
                  <div className="absolute top-8 left-8 w-56 h-40 rounded-2xl bg-gradient-to-br from-secondary-400 to-secondary-600 shadow-teal-lg transform rotate-6 opacity-80" />
                  {/* Middle card */}
                  <div className="absolute top-4 left-4 w-56 h-40 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 shadow-golden transform -rotate-3 opacity-90" />
                  {/* Front card */}
                  <div className="absolute top-0 left-0 w-56 h-40 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-coral-lg flex items-center justify-center">
                    <span className="text-5xl">✈️</span>
                  </div>
                  {/* Floating elements */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center animate-float">
                    <span className="text-2xl">🗺️</span>
                  </div>
                  <div
                    className="absolute bottom-4 -right-8 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center animate-float"
                    style={{ animationDelay: '1s' }}
                  >
                    <span className="text-xl">📍</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          MAIN CONTENT - 2-Column Layout
          ============================================ */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 pb-16">
        <div className="grid lg:grid-cols-[1fr_340px] gap-8 lg:gap-12">
          {/* Left Column: Upcoming Trips + Suggestions */}
          <div className="space-y-12">
            {/* ----------------------------------------
                UPCOMING TRIPS SECTION
                ---------------------------------------- */}
            <div className="animate-reveal-up stagger-3">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-editorial-headline text-2xl lg:text-3xl text-neutral-900">
                  {hasUpcoming ? 'Upcoming Trips' : 'Your Trips'}
                </h2>
                {itineraries.length > 2 && (
                  <Link
                    href="/dashboard/trips"
                    className="flex items-center gap-1 text-sm font-heading font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <span>View All Trips</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {displayTrips.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-6">
                  {displayTrips.map((trip, index) => (
                    <UpcomingTripCard key={trip.id} trip={trip} index={index} showCountdown={hasUpcoming} />
                  ))}
                </div>
              ) : (
                /* Empty State for Upcoming Trips */
                <Card variant="interactive" className="border-2 border-dashed border-neutral-200">
                  <CardContent padding="relaxed" className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
                      <Compass className="w-8 h-8 text-primary-500" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-neutral-900 mb-2">
                      No trips planned yet
                    </h3>
                    <p className="text-neutral-600 font-body mb-6 max-w-sm mx-auto">
                      Start planning your next adventure and share your journey with the world.
                    </p>
                    <Button onClick={() => router.push('/itinerary/new')} className="shadow-coral">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Trip
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* ----------------------------------------
                SUGGESTED FOR YOU SECTION
                ---------------------------------------- */}
            <div className="animate-reveal-up stagger-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-100 to-accent-50 flex items-center justify-center shadow-golden">
                    <Sparkles className="w-5 h-5 text-accent-600" />
                  </div>
                  <h2 className="text-editorial-headline text-2xl lg:text-3xl text-neutral-900">
                    Suggested for You
                  </h2>
                </div>
              </div>

              {suggestions.length > 0 ? (
                <div className="grid sm:grid-cols-3 gap-5">
                  {suggestions.map((itinerary, index) => (
                    <SuggestionCard key={itinerary.id} itinerary={itinerary} index={index} />
                  ))}
                </div>
              ) : (
                /* Fallback: Show explore prompt */
                <Card variant="editorial" className="overflow-hidden">
                  <CardContent padding="relaxed" className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary-100 to-secondary-50 flex items-center justify-center flex-shrink-0">
                      <Compass className="w-8 h-8 text-secondary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg text-neutral-900 mb-1">
                        Discover Travel Inspiration
                      </h3>
                      <p className="text-neutral-600 font-body text-sm mb-3">
                        Explore trips shared by travelers around the world.
                      </p>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => router.push('/explore')}
                      >
                        Browse Ideas
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <aside className="space-y-8">
            {/* ----------------------------------------
                MY FAVORITES - Coming Soon Placeholder
                ---------------------------------------- */}
            <div className="animate-reveal-up stagger-5">
              <h2 className="text-editorial-headline text-xl text-neutral-900 mb-4">My Favorites</h2>

              <Card variant="elevated" className="overflow-hidden">
                <CardContent padding="default" className="relative">
                  {/* Coming Soon Overlay */}
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mb-3">
                      <Lock className="w-5 h-5 text-primary-400" />
                    </div>
                    <span className="font-heading font-bold text-sm text-neutral-600">Coming Soon</span>
                    <span className="text-xs text-neutral-400 mt-1">Save your favorite spots</span>
                  </div>

                  {/* Placeholder Content */}
                  <div className="opacity-40 pointer-events-none">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 py-3 border-b border-neutral-100 last:border-0">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <Bookmark className="w-5 h-5 text-neutral-300" />
                        </div>
                        <div className="flex-1">
                          <div className="h-3 bg-neutral-100 rounded w-3/4 mb-1" />
                          <div className="h-2 bg-neutral-100 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="animate-reveal-up stagger-6">
              <h2 className="text-editorial-headline text-xl text-neutral-900 mb-4">Your Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <Card variant="default" className="text-center py-6">
                  <span className="block stat-number text-3xl text-primary-600 mb-1">
                    {itineraries.length}
                  </span>
                  <span className="text-xs font-heading text-neutral-500 uppercase tracking-wider">
                    Total Trips
                  </span>
                </Card>
                <Card variant="default" className="text-center py-6">
                  <span className="block stat-number text-3xl text-secondary-600 mb-1">
                    {itineraries.filter((t) => t.is_public).length}
                  </span>
                  <span className="text-xs font-heading text-neutral-500 uppercase tracking-wider">
                    Shared
                  </span>
                </Card>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {toDelete && (
        <DeleteModal
          onConfirm={() => handleDelete(toDelete)}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}

// ============================================
// UPCOMING TRIP CARD - Large Horizontal Card
// ============================================
interface UpcomingTripCardProps {
  trip: ItineraryWithDays
  index: number
  showCountdown?: boolean
}

function UpcomingTripCard({ trip, index, showCountdown = true }: UpcomingTripCardProps) {
  const router = useRouter()

  // Get date info
  const dates = trip.days.filter((d) => d.date).map((d) => new Date(d.date!))
  const startDate = dates.length > 0 ? dates[0] : null
  const endDate = dates.length > 0 ? dates[dates.length - 1] : null

  const dateRangeText =
    startDate && endDate
      ? startDate.getTime() === endDate.getTime()
        ? format(startDate, 'MMM d')
        : `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`
      : null

  // Days until trip
  const daysUntil = startDate ? differenceInDays(startDate, new Date()) : null

  const getCountdownBadge = () => {
    if (!startDate) return null
    if (isToday(startDate)) return { text: "Today!", color: 'bg-accent-500 text-white' }
    if (isTomorrow(startDate)) return { text: "Tomorrow", color: 'bg-accent-400 text-white' }
    if (daysUntil && daysUntil > 0 && daysUntil <= 14) {
      return { text: `${daysUntil} days`, color: 'bg-primary-100 text-primary-700' }
    }
    return null
  }

  const countdown = getCountdownBadge()

  // Decorative placeholder thumbnails
  const placeholderEmojis = ['🏛️', '🍜', '🌅', '🎭', '🏖️']

  return (
    <article
      onClick={() => router.push(trip.is_public ? `/t/${trip.slug}` : `/itinerary/${trip.id}/edit`)}
      className={cn(
        'group relative overflow-hidden rounded-2xl cursor-pointer',
        'bg-white border border-neutral-200/60',
        'shadow-sm hover:shadow-dramatic-lg',
        'transform transition-all duration-500 ease-out',
        'hover:scale-[1.02] hover:-translate-y-1'
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Cover Image */}
      <div className="relative h-44 sm:h-48 overflow-hidden">
        {trip.cover_photo_url ? (
          <>
            <img
              src={trip.cover_photo_url}
              alt={trip.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </>
        ) : (
          <div
            className={cn(
              'absolute inset-0',
              trip.is_public
                ? 'bg-gradient-to-br from-primary-400 via-primary-500 to-secondary-500'
                : 'bg-gradient-to-br from-neutral-400 to-neutral-500'
            )}
          >
            <div className="absolute inset-0 pattern-dots opacity-15" />
          </div>
        )}

        {/* Title & Date Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="font-display font-bold text-xl text-white mb-1 line-clamp-1 drop-shadow-lg">
            {trip.title}
          </h3>
          {dateRangeText && (
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <Calendar className="w-4 h-4" />
              <span className="font-heading font-medium">{dateRangeText}</span>
            </div>
          )}
        </div>

        {/* Countdown Badge - only show for upcoming trips */}
        {showCountdown && countdown && (
          <div className={cn('absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-heading font-bold', countdown.color)}>
            {countdown.text}
          </div>
        )}

        {/* Heart Icon (placeholder) */}
        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <Heart className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Decorative Thumbnail Row */}
      <div className="px-5 py-4 flex items-center justify-between border-t border-neutral-100">
        <div className="flex -space-x-2">
          {placeholderEmojis.slice(0, 5).map((emoji, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-neutral-100 border-2 border-white flex items-center justify-center text-sm"
            >
              {emoji}
            </div>
          ))}
        </div>

        {/* Trip type indicator */}
        <div className="flex items-center gap-1.5 text-xs font-heading font-semibold text-neutral-500">
          {trip.type === 'daily' ? (
            <>
              <Clock className="w-3.5 h-3.5" />
              <span>{trip.days.length} days</span>
            </>
          ) : (
            <>
              <Heart className="w-3.5 h-3.5" />
              <span>Guide</span>
            </>
          )}
        </div>
      </div>
    </article>
  )
}

// ============================================
// SUGGESTION CARD - Smaller Vertical Card
// ============================================
interface SuggestionCardProps {
  itinerary: ExploreItinerary
  index: number
}

function SuggestionCard({ itinerary, index }: SuggestionCardProps) {
  const router = useRouter()

  return (
    <article
      onClick={() => router.push(`/t/${itinerary.slug}`)}
      className={cn(
        'group relative overflow-hidden rounded-xl cursor-pointer',
        'bg-white border border-neutral-200/60',
        'shadow-sm hover:shadow-dramatic',
        'transform transition-all duration-400 ease-out',
        'hover:scale-[1.03] hover:-translate-y-1'
      )}
      style={{ animationDelay: `${index * 75}ms` }}
    >
      {/* Cover Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {itinerary.coverPhotoUrl ? (
          <>
            <img
              src={itinerary.coverPhotoUrl}
              alt={itinerary.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary-400 to-primary-400">
            <div className="absolute inset-0 pattern-dots opacity-20" />
          </div>
        )}

        {/* Heart Icon */}
        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Heart className="w-4 h-4 text-white" />
        </button>

        {/* Destination Badge */}
        {itinerary.destination && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-heading font-medium">
            <MapPin className="w-3 h-3" />
            <span>{itinerary.destination}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-heading font-bold text-sm text-neutral-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {itinerary.title}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <Avatar name={itinerary.creator.displayName} size="sm" color={itinerary.creator.avatarColor || undefined} />
          <span className="text-xs text-neutral-500 truncate">{itinerary.creator.displayName}</span>
        </div>
      </div>
    </article>
  )
}

// ============================================
// DELETE MODAL
// ============================================
function DeleteModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
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
            <Button variant="tertiary" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onConfirm}>
              Delete Trip
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
