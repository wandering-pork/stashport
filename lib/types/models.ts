// Database models (from Supabase)
export interface User {
  id: string
  auth_id: string | null
  email: string
  name: string | null
  display_name: string | null
  avatar_color: string
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  day_id: string
  title: string
  location: string | null
  start_time: string | null
  end_time: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Day {
  id: string
  itinerary_id: string
  day_number: number
  date: string | null
  title: string | null
  created_at: string
  updated_at: string
}

export interface Itinerary {
  id: string
  user_id: string
  title: string
  description: string | null
  destination: string | null
  slug: string
  is_public: boolean
  stashed_from_id: string | null
  budget_level: number | null
  created_at: string
  updated_at: string
}

// UI models (transformed from database models)
export interface ItineraryWithDays extends Itinerary {
  days: (Day & { activities: Activity[] })[]
  tags?: string[]
  creator?: {
    display_name: string | null
    avatar_color: string
  }
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}
