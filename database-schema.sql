-- ============================================================
-- STASHPORT DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS TABLE (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. ITINERARIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  destination TEXT,
  slug TEXT NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  stashed_from_id UUID REFERENCES public.itineraries(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for slug lookups
CREATE INDEX idx_itineraries_slug ON public.itineraries(slug);
CREATE INDEX idx_itineraries_user_id ON public.itineraries(user_id);
CREATE INDEX idx_itineraries_is_public ON public.itineraries(is_public);

-- ============================================================
-- 3. DAYS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  date TIMESTAMP WITH TIME ZONE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for itinerary lookups
CREATE INDEX idx_days_itinerary_id ON public.days(itinerary_id);

-- ============================================================
-- 4. ACTIVITIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID NOT NULL REFERENCES public.days(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  location TEXT,
  start_time TEXT,
  end_time TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for day lookups
CREATE INDEX idx_activities_day_id ON public.activities(day_id);

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USERS TABLE RLS
-- ============================================================
-- Users can only see their own record
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth_id = auth.uid());

-- Users can only update their own record
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth_id = auth.uid());

-- Service role can create user records during signup
CREATE POLICY "Service role can insert users" ON public.users
  FOR INSERT WITH CHECK (auth_id = auth.uid());

-- ============================================================
-- ITINERARIES TABLE RLS
-- ============================================================
-- Users can view their own itineraries
CREATE POLICY "Users can view own itineraries" ON public.itineraries
  FOR SELECT USING (user_id = auth.uid());

-- Anyone can view public itineraries
CREATE POLICY "Anyone can view public itineraries" ON public.itineraries
  FOR SELECT USING (is_public = TRUE);

-- Users can only insert their own itineraries
CREATE POLICY "Users can create own itineraries" ON public.itineraries
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can only update their own itineraries
CREATE POLICY "Users can update own itineraries" ON public.itineraries
  FOR UPDATE USING (user_id = auth.uid());

-- Users can only delete their own itineraries
CREATE POLICY "Users can delete own itineraries" ON public.itineraries
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- DAYS TABLE RLS
-- ============================================================
-- Users can view days of their own itineraries
CREATE POLICY "Users can view days of own itineraries" ON public.days
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.itineraries
      WHERE itineraries.id = days.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );

-- Anyone can view days of public itineraries
CREATE POLICY "Anyone can view days of public itineraries" ON public.days
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.itineraries
      WHERE itineraries.id = days.itinerary_id
      AND itineraries.is_public = TRUE
    )
  );

-- Users can only manipulate days of their own itineraries
CREATE POLICY "Users can manage days of own itineraries" ON public.days
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.itineraries
      WHERE itineraries.id = days.itinerary_id
      AND itineraries.user_id = auth.uid()
    )
  );

-- ============================================================
-- ACTIVITIES TABLE RLS
-- ============================================================
-- Users can view activities of their own itineraries
CREATE POLICY "Users can view activities of own itineraries" ON public.activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.days
      INNER JOIN public.itineraries ON itineraries.id = days.itinerary_id
      WHERE days.id = activities.day_id
      AND itineraries.user_id = auth.uid()
    )
  );

-- Anyone can view activities of public itineraries
CREATE POLICY "Anyone can view activities of public itineraries" ON public.activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.days
      INNER JOIN public.itineraries ON itineraries.id = days.itinerary_id
      WHERE days.id = activities.day_id
      AND itineraries.is_public = TRUE
    )
  );

-- Users can only manipulate activities in their own itineraries
CREATE POLICY "Users can manage activities of own itineraries" ON public.activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.days
      INNER JOIN public.itineraries ON itineraries.id = days.itinerary_id
      WHERE days.id = activities.day_id
      AND itineraries.user_id = auth.uid()
    )
  );

-- ============================================================
-- DONE
-- ============================================================
