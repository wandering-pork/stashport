import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createServerClient()

    // Fetch public itinerary by slug with creator info
    const { data: itinerary, error } = await supabase
      .from('itineraries')
      .select(
        `
        *,
        days(
          *,
          activities(*)
        ),
        users!itineraries_user_id_fkey(
          display_name,
          avatar_color
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

    // Fetch tags
    const { data: tags } = await supabase
      .from('trip_tags')
      .select('tag')
      .eq('itinerary_id', itinerary.id)

    // Transform response
    const { users, ...itineraryData } = itinerary as any
    const response = {
      ...itineraryData,
      tags: tags?.map(t => t.tag) || [],
      creator: users ? {
        display_name: users.display_name,
        avatar_color: users.avatar_color || '#14b8a6',
      } : null,
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
