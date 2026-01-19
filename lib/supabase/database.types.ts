export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_id: string | null
          email: string
          name: string | null
          display_name: string | null
          avatar_color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_id?: string | null
          email: string
          name?: string | null
          display_name?: string | null
          avatar_color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_id?: string | null
          email?: string
          name?: string | null
          display_name?: string | null
          avatar_color?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_auth_id_fkey"
            columns: ["auth_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      itineraries: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          destination?: string | null
          slug: string
          is_public?: boolean
          stashed_from_id?: string | null
          budget_level?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          destination?: string | null
          slug?: string
          is_public?: boolean
          stashed_from_id?: string | null
          budget_level?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "itineraries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itineraries_stashed_from_id_fkey"
            columns: ["stashed_from_id"]
            isOneToOne: false
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          }
        ]
      }
      days: {
        Row: {
          id: string
          itinerary_id: string
          day_number: number
          date: string | null
          title: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          itinerary_id: string
          day_number: number
          date?: string | null
          title?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          itinerary_id?: string
          day_number?: number
          date?: string | null
          title?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "days_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          }
        ]
      }
      activities: {
        Row: {
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
        Insert: {
          id?: string
          day_id: string
          title: string
          location?: string | null
          start_time?: string | null
          end_time?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          day_id?: string
          title?: string
          location?: string | null
          start_time?: string | null
          end_time?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "days"
            referencedColumns: ["id"]
          }
        ]
      }
      trip_tags: {
        Row: {
          id: string
          itinerary_id: string
          tag: string
          created_at: string
        }
        Insert: {
          id?: string
          itinerary_id: string
          tag: string
          created_at?: string
        }
        Update: {
          id?: string
          itinerary_id?: string
          tag?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_tags_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
