'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { ExploreCard, ExploreItinerary } from '@/components/itinerary/explore-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Loader2,
  Compass,
  RefreshCw,
  ChevronDown,
  Sparkles,
  Globe2,
  Search,
  MapPin,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// Main page with Suspense boundary
export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreLoading />}>
      <ExploreContent />
    </Suspense>
  )
}

function ExploreLoading() {
  return (
    <div className="min-h-screen bg-mesh-editorial flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center shadow-lg">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
        <p className="text-neutral-500 font-body">Discovering adventures...</p>
      </div>
    </div>
  )
}

interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasMore: boolean
}

function ExploreContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [itineraries, setItineraries] = useState<ExploreItinerary[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [activeSearch, setActiveSearch] = useState(searchParams.get('q') || '')

  const fetchItineraries = useCallback(
    async (page: number = 1, append: boolean = false) => {
      try {
        if (page === 1) {
          setIsLoading(true)
        } else {
          setIsLoadingMore(true)
        }
        setError(null)

        const params = new URLSearchParams({
          page: page.toString(),
          limit: '12',
        })

        if (activeSearch) {
          params.set('destination', activeSearch)
        }

        const response = await fetch(`/api/itineraries/explore?${params.toString()}`)

        if (!response.ok) {
          throw new Error('Failed to fetch adventures')
        }

        const data = await response.json()

        if (append) {
          setItineraries((prev) => [...prev, ...data.itineraries])
        } else {
          setItineraries(data.itineraries)
        }
        setPagination(data.pagination)
      } catch (err: any) {
        console.error('[ExplorePage] Error fetching:', err)
        setError(err.message || 'Something went wrong')
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [activeSearch]
  )

  useEffect(() => {
    fetchItineraries()
  }, [fetchItineraries])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveSearch(searchQuery)

    // Update URL
    const params = new URLSearchParams()
    if (searchQuery) {
      params.set('q', searchQuery)
    }
    router.push(`/explore${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setActiveSearch('')
    router.push('/explore')
  }

  const handleLoadMore = () => {
    if (pagination && pagination.hasMore) {
      fetchItineraries(pagination.page + 1, true)
    }
  }

  const handleRefresh = () => {
    fetchItineraries(1, false)
  }

  return (
    <div className="min-h-screen bg-mesh-editorial">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Wave Background */}
        <div className="absolute inset-0 bg-wave-cool opacity-50" />

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-secondary-200/30 to-transparent rounded-full -ml-48 -mt-48 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-gradient-to-tl from-primary-200/20 to-transparent rounded-full -mr-32 -mb-32 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 pt-12 lg:pt-16 pb-12 lg:pb-16">
          <div className="max-w-2xl animate-reveal-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-100 to-secondary-50 flex items-center justify-center shadow-teal">
                <Compass className="w-6 h-6 text-secondary-600" />
              </div>
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-secondary-600">
                Explore
              </span>
            </div>

            <h1 className="text-editorial-display text-4xl sm:text-5xl lg:text-6xl text-neutral-900 mb-4">
              Discover{' '}
              <span className="text-gradient-cool">Travel Inspiration</span>
            </h1>

            <p className="text-lg lg:text-xl text-neutral-600 font-body max-w-lg mb-8">
              Browse itineraries shared by travelers around the world. Find your next adventure.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-lg">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search by destination (e.g., Japan, Paris...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    'w-full pl-12 pr-24 py-4 rounded-2xl',
                    'bg-white border-2 border-neutral-200',
                    'font-body text-neutral-900 placeholder:text-neutral-400',
                    'focus:outline-none focus:border-secondary-400 focus:ring-4 focus:ring-secondary-100',
                    'transition-all duration-300',
                    'shadow-sm hover:shadow-md'
                  )}
                />
                <Button
                  type="submit"
                  size="md"
                  variant="secondary"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Active Search Tag */}
            {activeSearch && (
              <div className="mt-4 flex items-center gap-2 animate-fade-in">
                <span className="text-sm text-neutral-500 font-body">Showing results for:</span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary-100 text-secondary-700 rounded-full text-sm font-heading font-semibold">
                  <MapPin className="w-3.5 h-3.5" />
                  {activeSearch}
                  <button
                    onClick={handleClearSearch}
                    className="hover:text-secondary-900 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 pb-16">
        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center shadow-lg">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center shadow-md">
                <Globe2 className="w-4 h-4 text-accent-600" />
              </div>
            </div>
            <h3 className="text-xl font-display font-bold text-neutral-900 mb-2">
              Discovering adventures
            </h3>
            <p className="text-neutral-500 font-body">
              Finding inspiration from travelers around the world...
            </p>
          </div>
        ) : error ? (
          /* Error State */
          <Card variant="elevated" className="border-2 border-red-200 animate-reveal-up max-w-lg mx-auto">
            <CardContent padding="relaxed" className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">😕</span>
              </div>
              <h3 className="text-xl font-display font-bold text-neutral-900 mb-2">
                Couldn't load adventures
              </h3>
              <p className="text-neutral-600 font-body mb-6">{error}</p>
              <Button variant="primary" onClick={handleRefresh} className="shadow-coral">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : itineraries.length === 0 ? (
          /* Empty State */
          <Card variant="editorial" className="relative overflow-hidden animate-reveal-up max-w-2xl mx-auto">
            <div className="absolute inset-0 pattern-dots opacity-10" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-200/30 to-transparent rounded-full blur-3xl" />

            <CardContent padding="none" className="relative z-10 py-16 px-8 text-center">
              <div className="relative inline-block mb-8">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center shadow-xl mx-auto">
                  <Compass className="w-12 h-12 text-primary-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center shadow-lg animate-float">
                  <Sparkles className="w-5 h-5 text-accent-600" />
                </div>
              </div>

              <h3 className="text-editorial-headline text-3xl lg:text-4xl text-neutral-900 mb-4">
                {activeSearch ? (
                  <>
                    No trips found for{' '}
                    <span className="text-gradient-vibrant">"{activeSearch}"</span>
                  </>
                ) : (
                  <>
                    No adventures to explore
                    <span className="text-gradient-vibrant"> yet</span>
                  </>
                )}
              </h3>

              <p className="text-lg text-neutral-600 font-body mb-8 max-w-md mx-auto">
                {activeSearch
                  ? 'Try searching for a different destination or browse all trips.'
                  : 'Be the first to share your journey! Create a public trip and inspire travelers around the world.'}
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                {activeSearch && (
                  <Button variant="secondary" size="lg" onClick={handleClearSearch}>
                    <X className="w-4 h-4 mr-2" />
                    Clear Search
                  </Button>
                )}
                <Button
                  size="lg"
                  onClick={() => router.push('/itinerary/new')}
                  className="font-heading font-bold shadow-coral hover:shadow-coral-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Your First Trip
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Results Grid */
          <div className="space-y-8">
            {/* Results count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500 font-body">
                Showing{' '}
                <span className="font-heading font-bold text-neutral-700">
                  {itineraries.length}
                </span>{' '}
                of{' '}
                <span className="font-heading font-bold text-neutral-700">
                  {pagination?.totalCount || 0}
                </span>{' '}
                adventures
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {itineraries.map((itinerary, index) => (
                <ExploreCard key={itinerary.id} itinerary={itinerary} index={index} />
              ))}
            </div>

            {/* Load More */}
            {pagination?.hasMore && (
              <div className="text-center pt-4">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleLoadMore}
                  isLoading={isLoadingMore}
                  className="font-heading font-bold min-w-[200px]"
                >
                  {isLoadingMore ? (
                    'Loading...'
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5 mr-2" />
                      Load More Adventures
                      <span className="ml-2 text-neutral-500">
                        ({pagination.totalCount - itineraries.length} more)
                      </span>
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* End of list */}
            {pagination && !pagination.hasMore && itineraries.length > 6 && (
              <div className="text-center py-8 animate-fade-in">
                <div className="inline-flex items-center gap-2 text-neutral-400 text-sm font-body">
                  <span className="w-8 h-px bg-neutral-200" />
                  <span>You've seen all {pagination.totalCount} adventures</span>
                  <span className="w-8 h-px bg-neutral-200" />
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
