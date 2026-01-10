'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { mockItineraries } from '@/lib/utils/mock-data'
import { Edit2, Eye, Trash2, Copy } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [itineraries] = useState(mockItineraries)
  const [toDelete, setToDelete] = useState<string | null>(null)

  const publicTrips = itineraries.filter(it => it.is_public)
  const privateTrips = itineraries.filter(it => !it.is_public)

  const handleDelete = (id: string) => {
    // TODO: Replace with actual delete
    console.log('Delete itinerary:', id)
    setToDelete(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold">My Trips</h1>
          <Button onClick={() => router.push('/itinerary/new')}>
            + Create New Trip
          </Button>
        </div>
        <p className="text-gray-600">Manage and share your travel itineraries</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{itineraries.length}</div>
              <div className="text-sm text-gray-600">Total Trips</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{publicTrips.length}</div>
              <div className="text-sm text-gray-600">Public</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{privateTrips.length}</div>
              <div className="text-sm text-gray-600">Private</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Public Trips */}
      {publicTrips.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Public Trips</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicTrips.map((trip) => (
              <Card key={trip.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-semibold truncate">{trip.title}</h3>
                  {trip.destination && (
                    <p className="text-sm text-gray-600">{trip.destination}</p>
                  )}
                </CardHeader>
                <CardContent>
                  {trip.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {trip.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {trip.days.length} day{trip.days.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/t/${trip.slug}`)}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        title="View public page"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => router.push(`/itinerary/${trip.id}/edit`)}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => console.log('Copy link')}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        title="Copy share link"
                      >
                        <Copy className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => setToDelete(trip.id)}
                        className="p-2 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Private Trips */}
      {privateTrips.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Private Trips</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {privateTrips.map((trip) => (
              <Card key={trip.id} className="hover:shadow-md transition-shadow opacity-75">
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-semibold truncate">{trip.title}</h3>
                  {trip.destination && (
                    <p className="text-sm text-gray-600">{trip.destination}</p>
                  )}
                  <span className="inline-block text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded mt-2 w-fit">
                    Private
                  </span>
                </CardHeader>
                <CardContent>
                  {trip.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {trip.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {trip.days.length} day{trip.days.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/itinerary/${trip.id}/edit`)}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => setToDelete(trip.id)}
                        className="p-2 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {itineraries.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">No trips yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first trip to get started
              </p>
              <Button onClick={() => router.push('/itinerary/new')}>
                Create Your First Trip
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      {toDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <h2 className="text-lg font-semibold">Delete Trip?</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Are you sure you want to delete this trip? This action cannot be undone.
              </p>
            </CardContent>
            <div className="px-6 py-4 border-t border-gray-200 flex gap-2 justify-end">
              <Button
                variant="secondary"
                onClick={() => setToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  handleDelete(toDelete)
                }}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
