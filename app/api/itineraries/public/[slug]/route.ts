import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createServerClient()

    // Fetch public itinerary by slug
    const { data: itinerary, error } = await supabase
      .from('itineraries')
      .select(
        `
        *,
        days(
          *,
          activities(*)
        )
      `
      )
      .eq('slug', slug)
      .eq('is_public', true)
      .single()

    if (error || !itinerary) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(itinerary)
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
