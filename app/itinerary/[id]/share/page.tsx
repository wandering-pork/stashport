import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { SharePageClient } from './share-page-client'

interface SharePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: itinerary } = await supabase
    .from('itineraries')
    .select('title, destination')
    .eq('id', id)
    .single()

  return {
    title: itinerary
      ? `Share: ${itinerary.title} | Stashport`
      : 'Share Trip | Stashport',
    description: itinerary?.destination
      ? `Create a beautiful share image for your ${itinerary.destination} trip`
      : 'Create a beautiful share image for your trip',
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params

  console.log('[Page] Share page - Fetching itinerary:', { id })

  const supabase = await createServerClient()

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.log('[Page] Share page - Unauthorized, redirecting to login')
    redirect('/auth/login')
  }

  // Fetch itinerary with days and activities
  const { data: itinerary, error } = await supabase
    .from('itineraries')
    .select(
      `
      *,
      days (
        *,
        activities (
          *
        )
      )
    `
    )
    .eq('id', id)
    .single()

  if (error || !itinerary) {
    console.error('[Page] Share page - Error fetching itinerary:', error)
    notFound()
  }

  // Check if user owns this itinerary
  if (itinerary.user_id !== user.id) {
    console.log('[Page] Share page - Forbidden, user does not own itinerary')
    redirect('/dashboard')
  }

  console.log('[Page] Share page - Itinerary fetched:', {
    id: itinerary.id,
    title: itinerary.title,
    daysCount: itinerary.days?.length || 0,
  })

  return <SharePageClient itinerary={itinerary} />
}
