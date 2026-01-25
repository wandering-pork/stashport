import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * GET /api/itineraries/explore
 *
 * Fetches public itineraries from other users for the Explore section.
 * Excludes current user's itineraries.
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 12, max: 50)
 * - destination: string (optional filter)
 * - tags: string (comma-separated, optional filter)
 * - sort: 'recent' | 'popular' (default: 'recent')
 * - type: 'daily' | 'guide' | 'all' (default: 'all')
 */
export async function GET(request: NextRequest) {
  console.log('[API] GET /api/itineraries/explore - Request received')

  try {
    const supabase = await createServerClient()

    // Get current user (optional - guests can also browse)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)))
    const destination = searchParams.get('destination')
    const tagsParam = searchParams.get('tags')
    const sort = searchParams.get('sort') || 'recent'
    const typeFilter = searchParams.get('type') || 'all'

    const offset = (page - 1) * limit

    console.log('[API] GET /api/itineraries/explore - Params:', {
      page,
      limit,
      offset,
      destination,
      tags: tagsParam,
      sort,
      type: typeFilter,
      currentUserId: user?.id || 'guest',
    })

    // Build the query for public itineraries
    let query = supabase
      .from('itineraries')
      .select(`
        id,
        title,
        description,
        destination,
        slug,
        is_public,
        budget_level,
        type,
        cover_photo_url,
        created_at,
        updated_at,
        user_id,
        users!inner(
          id,
          display_name,
          avatar_color
        ),
        days(
          id
        )
      `, { count: 'exact' })
      .eq('is_public', true)

    // Exclude current user's itineraries if logged in
    if (user) {
      query = query.neq('user_id', user.id)
    }

    // Filter by destination if provided
    if (destination) {
      query = query.ilike('destination', `%${destination}%`)
    }

    // Filter by type if specified
    if (typeFilter !== 'all' && (typeFilter === 'daily' || typeFilter === 'guide')) {
      query = query.eq('type', typeFilter)
    }

    // Sort order
    if (sort === 'popular') {
      // For now, sort by created_at descending
      // Future: implement stash_count sorting
      query = query.order('created_at', { ascending: false })
    } else {
      // Default: recent first
      query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: itineraries, error, count } = await query

    if (error) {
      console.error('[API] GET /api/itineraries/explore - Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch public itineraries' },
        { status: 500 }
      )
    }

    // Get itinerary IDs for tag lookup
    const itineraryIds = itineraries?.map(i => i.id) || []

    // Fetch tags for all itineraries
    let tagsMap: Record<string, string[]> = {}
    if (itineraryIds.length > 0) {
      const { data: tags, error: tagsError } = await supabase
        .from('trip_tags')
        .select('itinerary_id, tag')
        .in('itinerary_id', itineraryIds)

      if (!tagsError && tags) {
        tagsMap = tags.reduce((acc, { itinerary_id, tag }) => {
          if (!acc[itinerary_id]) acc[itinerary_id] = []
          acc[itinerary_id].push(tag)
          return acc
        }, {} as Record<string, string[]>)
      }
    }

    // Filter by tags if specified (post-query filter for simplicity)
    let filteredItineraries = itineraries || []
    if (tagsParam) {
      const filterTags = tagsParam.split(',').map(t => t.trim().toLowerCase())
      filteredItineraries = filteredItineraries.filter(itinerary => {
        const itineraryTags = tagsMap[itinerary.id] || []
        return filterTags.some(filterTag =>
          itineraryTags.some(tag => tag.toLowerCase() === filterTag)
        )
      })
    }

    // Transform response
    const response = filteredItineraries.map(itinerary => ({
      id: itinerary.id,
      title: itinerary.title,
      description: itinerary.description,
      destination: itinerary.destination,
      slug: itinerary.slug,
      budgetLevel: itinerary.budget_level,
      type: itinerary.type,
      coverPhotoUrl: itinerary.cover_photo_url,
      createdAt: itinerary.created_at,
      dayCount: itinerary.days?.length || 0,
      tags: tagsMap[itinerary.id] || [],
      creator: {
        id: (itinerary.users as any)?.id,
        displayName: (itinerary.users as any)?.display_name || 'Anonymous',
        avatarColor: (itinerary.users as any)?.avatar_color,
      },
    }))

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)
    const hasMore = page < totalPages

    console.log('[API] GET /api/itineraries/explore - Success:', {
      count: response.length,
      totalCount,
      page,
      totalPages,
      hasMore,
    })

    return NextResponse.json({
      itineraries: response,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore,
      },
    })
  } catch (err) {
    console.error('[API] GET /api/itineraries/explore - Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
