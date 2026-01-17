'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { ItineraryForm } from '@/components/itinerary/itinerary-form'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function CreateItineraryPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-color-surface via-cream to-color-surface flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-16 h-16 text-primary-500 animate-spin mx-auto mb-6" />
          <p className="text-lg text-neutral-600 font-body">Preparing your canvas...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div>
      <ItineraryForm />
    </div>
  )
}
