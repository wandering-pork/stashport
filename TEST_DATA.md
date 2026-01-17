# Test Data for Stashport

Run this SQL in Supabase SQL Editor to populate test data.

---

## SQL Insert Script

```sql
-- ============================================================
-- STASHPORT TEST DATA
-- Run this in Supabase SQL Editor
-- ============================================================

DO $$
DECLARE
  v_user_id UUID;
  v_itinerary_1 UUID;
  v_itinerary_2 UUID;
  v_itinerary_3 UUID;
  v_day_id UUID;
BEGIN

  -- ============================================================
  -- CREATE TEST USER
  -- ============================================================
  INSERT INTO users (id, email, name, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'testuser@stashport.dev',
    'Test User',
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET name = 'Test User'
  RETURNING id INTO v_user_id;

  RAISE NOTICE 'Using user ID: %', v_user_id;

  -- ============================================================
  -- ITINERARY 1: Japan Adventure (7 days)
  -- ============================================================
  INSERT INTO itineraries (id, user_id, title, description, destination, slug, is_public)
  VALUES (
    gen_random_uuid(),
    v_user_id,
    'Tokyo & Mount Fuji Adventure',
    'An exciting week exploring Tokyo''s vibrant neighborhoods and conquering Mount Fuji. From ancient temples to futuristic technology, experience the best of Japan.',
    'Japan',
    'tokyo-mount-fuji-adventure-' || substr(md5(random()::text), 1, 8),
    true
  ) RETURNING id INTO v_itinerary_1;

  -- Day 1
  INSERT INTO days (id, itinerary_id, day_number, date, title)
  VALUES (gen_random_uuid(), v_itinerary_1, 1, '2025-08-01', 'Arrival & Shibuya Exploration')
  RETURNING id INTO v_day_id;

  INSERT INTO activities (day_id, title, location, start_time, notes) VALUES
    (v_day_id, 'Check into hotel', 'Shinjuku, Tokyo', '14:00', 'Park Hyatt Tokyo'),
    (v_day_id, 'Shibuya Crossing visit', 'Shibuya', '18:00', 'Watch the famous crossing'),
    (v_day_id, 'Dinner at Ichiran Ramen', 'Shibuya', '19:30', 'Try the solo booth experience');

  -- Day 2
  INSERT INTO days (id, itinerary_id, day_number, date, title)
  VALUES (gen_random_uuid(), v_itinerary_1, 2, '2025-08-02', 'Temples & Traditional Culture')
  RETURNING id INTO v_day_id;

  INSERT INTO activities (day_id, title, location, start_time, notes) VALUES
    (v_day_id, 'Senso-ji Temple', 'Asakusa', '08:00', 'Oldest temple in Tokyo'),
    (v_day_id, 'Nakamise Shopping Street', 'Asakusa', '10:00', 'Traditional snacks and souvenirs'),
    (v_day_id, 'Teamlab Borderless', 'Odaiba', '15:00', 'Book tickets in advance!');

  -- Day 3
  INSERT INTO days (id, itinerary_id, day_number, date, title)
  VALUES (gen_random_uuid(), v_itinerary_1, 3, '2025-08-03', 'Mount Fuji Climb Begins')
  RETURNING id INTO v_day_id;

  INSERT INTO activities (day_id, title, location, start_time, notes) VALUES
    (v_day_id, 'Mount Fuji Climbing Expedition', 'Fuji-Yoshida', '06:00', '2-day climb: Start from 5th station, overnight at 8th station hut, summit for sunrise');

  -- Day 4
  INSERT INTO days (id, itinerary_id, day_number, date, title)
  VALUES (gen_random_uuid(), v_itinerary_1, 4, '2025-08-04', 'Summit & Return')
  RETURNING id INTO v_day_id;

  INSERT INTO activities (day_id, title, location, start_time, notes) VALUES
    (v_day_id, 'Fuji Summit Sunrise', 'Mount Fuji Summit', '05:00', 'Watch sunrise from the top'),
    (v_day_id, 'Descend & Return to Tokyo', 'Mount Fuji', '10:00', 'Take bus back to Shinjuku');

  -- Day 5
  INSERT INTO days (id, itinerary_id, day_number, date, title)
  VALUES (gen_random_uuid(), v_itinerary_1, 5, '2025-08-05', 'Hot Springs & Relaxation')
  RETURNING id INTO v_day_id;

  INSERT INTO activities (day_id, title, location, start_time, notes) VALUES
    (v_day_id, 'Travel to Hakone', 'Hakone', '09:00', 'Take Romance Car'),
    (v_day_id, 'Hakone Open Air Museum', 'Hakone', '11:00', 'Outdoor sculpture garden'),
    (v_day_id, 'Onsen experience', 'Hakone', '16:00', 'Traditional hot spring bath');

  -- Day 6
  INSERT INTO days (id, itinerary_id, day_number, date, title)
  VALUES (gen_random_uuid(), v_itinerary_1, 6, '2025-08-06', 'Shopping & Akihabara')
  RETURNING id INTO v_day_id;

  INSERT INTO activities (day_id, title, location, start_time, notes) VALUES
    (v_day_id, 'Tsukiji Outer Market', 'Tsukiji', '07:00', 'Fresh sushi breakfast'),
    (v_day_id, 'Akihabara exploration', 'Akihabara', '12:00', 'Electronics and anime'),
    (v_day_id, 'Ginza shopping', 'Ginza', '16:00', 'High-end shopping district');

  -- Day 7
  INSERT INTO days (id, itinerary_id, day_number, date, title)
  VALUES (gen_random_uuid(), v_itinerary_1, 7, '2025-08-07', 'Final Morning & Departure')
  RETURNING id INTO v_day_id;

  INSERT INTO activities (day_id, title, location, start_time, notes) VALUES
    (v_day_id, 'Meiji Shrine morning visit', 'Harajuku', '07:00', 'Peaceful morning walk'),
    (v_day_id, 'Departure to airport', 'Narita/Haneda', '12:00', 'Allow 2 hours for check-in');

  -- ============================================================
  -- ITINERARY 2: Iceland Ring Road (10 days)
  -- ============================================================
  INSERT INTO itineraries (id, user_id, title, description, destination, slug, is_public)
  VALUES (
    gen_random_uuid(),
    v_user_id,
    'Iceland Ring Road Adventure',
    'Epic road trip around Iceland''s Ring Road, featuring glaciers, waterfalls, volcanoes, and the Northern Lights. Self-drive adventure through otherworldly landscapes.',
    'Iceland',
    'iceland-ring-road-' || substr(md5(random()::text), 1, 8),
    true
  ) RETURNING id INTO v_itinerary_2;

  -- Day 1
  INSERT INTO days (id, itinerary_id, day_number, date, title)
  VALUES (gen_random_uuid(), v_itinerary_2, 1, '2025-09-01', 'Capital City Exploration')
  RETURNING id INTO v_day_id;

  INSERT INTO activities (day_id, title, location, start_time, notes) VALUES
    (v_day_id, 'Pick up rental car', 'Keflavik Airport', '10:00', '4x4 recommended'),
    (v_day_id, 'Hallgrimskirkja Church', 'Reykjavik', '14:00', 'Iconic church with views'),
    (v_day_id, 'Harpa Concert Hall', 'Reykjavik', '16:00', 'Stunning architecture');

  -- Day 2
  INSERT INTO days (id, itinerary_id, day_number, date, title)
  VALUES (gen_random_uuid(), v_itinerary_2, 2, '2025-09-02', 'Waterfalls & Black Beaches')
  RETURNING id INTO v_day_id;

  INSERT INTO activities (day_id, title, location, start_time, notes) VALUES
    (v_day_id, 'South Coast Road Trip', 'South Iceland', '08:00', '2-day trip: Seljalandsfoss, Skogafoss, Reynisfjara Black Beach, Vik');

  -- Day 3
  INSERT INTO days (id, itinerary_id, day_number, date, title)
  VALUES (gen_random_uuid(), v_itinerary_2, 3, '2025-09-03', 'Continue to Glacier Lagoon')
  RETURNING id INTO v_day_id;

  INSERT INTO activities (day_id, title, location, start_time, notes) VALUES
    (v_day_id, 'Drive to Jokulsarlon', 'South Iceland', '09:00', 'Scenic drive along coast');

  -- Day 4
  INSERT INTO days (id, itinerary_id, day_number, date, title)
  VALUES (gen_random_uuid(), v_itinerary_2, 4, '2025-09-04', 'Jokulsarlon & Ice Caves')
  RETURNING id INTO v_day_id;

  INSERT INTO activities (day_id, title, location, start_time, notes) VALUES
    (v_day_id, 'Glacier Lagoon Boat Tour', 'Jokulsarlon', '09:00', 'Amphibian boat among icebergs'),
    (v_day_id, 'Diamond Beach', 'Jokulsarlon', '12:00', 'Icebergs on black sand'),
    (v_day_id, 'Ice Cave Tour', 'Vatnajokull', '14:00', 'Winter only - book in advance');

  -- Day 5
  INSERT INTO days (id, itinerary_id, day_number, date, title)
  VALUES (gen_random_uuid(), v_itinerary_2, 5, '2025-09-05', 'East Fjords Drive')
  RETURNING id INTO v_day_id;

  INSERT INTO activities (day_id, title, location, start_time, notes) VALUES
    (v_day_id, 'East Fjords scenic drive', 'East Iceland', '08:00', 'Stunning coastal views'),
    (v_day_id, 'Seydisfjordur town', 'Seydisfjordur', '14:00', 'Colorful artistic town');

  -- Day 6
  INSERT INTO days (id, itinerary_id, day_number, date, title)
  VALUES (gen_random_uuid(), v_itinerary_2, 6, '2025-09-06', 'Whale Watching & Husavik')
  RETURNING id INTO v_day_id;

  INSERT INTO activities (day_id, title, location, start_time, notes) VALUES
    (v_day_id, 'Drive to Husavik', 'North Iceland', '08:00', 'Through highland roads'),
    (v_day_id, 'Whale watching tour', 'Husavik', '14:00', 'Book in advance!');

  -- Day 7
  INSERT INTO days (id, itinerary_id, day_number, date, title)
  VALUES (gen_random_uuid(), v_itinerary_2, 7, '2025-09-07', 'Volcanic Landscapes')
  RETURNING id INTO v_day_id;

  INSERT INTO activities (day_id, title, location, start_time, notes) VALUES
    (v_day_id, 'Godafoss waterfall', 'Godafoss', '09:00', 'Waterfall of the Gods'),
    (v_day_id, 'Myvatn Nature Baths', 'Lake Myvatn', '14:00', 'Geothermal hot springs'),
    (v_day_id, 'Dimmuborgir lava fields', 'Lake Myvatn', '17:00', 'Dark fortress rock formations');

  -- Day 8
  INSERT INTO days (id, itinerary_id, day_number, date, title)
  VALUES (gen_random_uuid(), v_itinerary_2, 8, '2025-09-08', 'Drive to Snaefellsnes')
  RETURNING id INTO v_day_id;

  INSERT INTO activities (day_id, title, location, start_time, notes) VALUES
    (v_day_id, 'Long scenic drive west', 'West Iceland', '07:00', 'Full day of driving');

  -- Day 9
  INSERT INTO days (id, itinerary_id, day_number, date, title)
  VALUES (gen_random_uuid(), v_itinerary_2, 9, '2025-09-09', 'Iceland in Miniature')
  RETURNING id INTO v_day_id;

  INSERT INTO activities (day_id, title, location, start_time, notes) VALUES
    (v_day_id, 'Kirkjufell Mountain', 'Grundarfjordur', '08:00', 'Most photographed mountain'),
    (v_day_id, 'Snaefellsjokull National Park', 'Snaefellsnes', '12:00', 'Glacier-capped volcano');

  -- Day 10
  INSERT INTO days (id, itinerary_id, day_number, date, title)
  VALUES (gen_random_uuid(), v_itinerary_2, 10, '2025-09-10', 'Golden Circle & Departure')
  RETURNING id INTO v_day_id;

  INSERT INTO activities (day_id, title, location, start_time, notes) VALUES
    (v_day_id, 'Thingvellir National Park', 'Golden Circle', '08:00', 'Tectonic plates meeting point'),
    (v_day_id, 'Geysir geothermal area', 'Golden Circle', '11:00', 'Erupting hot springs'),
    (v_day_id, 'Return car & departure', 'Keflavik', '16:00', 'End of adventure');

  -- ============================================================
  -- ITINERARY 3: Paris Weekend (3 days)
  -- ============================================================
  INSERT INTO itineraries (id, user_id, title, description, destination, slug, is_public)
  VALUES (
    gen_random_uuid(),
    v_user_id,
    'Paris Long Weekend',
    'A romantic weekend getaway to the City of Light. Art, cuisine, and unforgettable moments.',
    'France',
    'paris-long-weekend-' || substr(md5(random()::text), 1, 8),
    false
  ) RETURNING id INTO v_itinerary_3;

  -- Day 1
  INSERT INTO days (id, itinerary_id, day_number, date, title)
  VALUES (gen_random_uuid(), v_itinerary_3, 1, '2025-10-10', 'Artistic Paris')
  RETURNING id INTO v_day_id;

  INSERT INTO activities (day_id, title, location, start_time, notes) VALUES
    (v_day_id, 'Check into hotel', 'Le Marais', '12:00', 'Boutique hotel'),
    (v_day_id, 'Sacre-Coeur Basilica', 'Montmartre', '15:00', 'Hilltop views'),
    (v_day_id, 'Dinner at local bistro', 'Montmartre', '19:00', 'Try French onion soup');

  -- Day 2
  INSERT INTO days (id, itinerary_id, day_number, date, title)
  VALUES (gen_random_uuid(), v_itinerary_3, 2, '2025-10-11', 'Icons & Museums')
  RETURNING id INTO v_day_id;

  INSERT INTO activities (day_id, title, location, start_time, notes) VALUES
    (v_day_id, 'Louvre Museum', '1st arrondissement', '09:00', 'Book timed entry'),
    (v_day_id, 'Seine River Cruise', 'Seine', '14:00', '1-hour cruise'),
    (v_day_id, 'Eiffel Tower sunset', '7th arrondissement', '18:00', 'Book summit tickets');

  -- Day 3
  INSERT INTO days (id, itinerary_id, day_number, date, title)
  VALUES (gen_random_uuid(), v_itinerary_3, 3, '2025-10-12', 'Morning Stroll & Au Revoir')
  RETURNING id INTO v_day_id;

  INSERT INTO activities (day_id, title, location, start_time, notes) VALUES
    (v_day_id, 'Croissant breakfast', 'Saint-Germain', '08:00', 'Best bakeries here'),
    (v_day_id, 'Luxembourg Gardens walk', '6th arrondissement', '10:00', 'Beautiful gardens');

  -- ============================================================
  -- DONE
  -- ============================================================
  RAISE NOTICE '✓ Test data inserted successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'User: testuser@stashport.dev (ID: %)', v_user_id;
  RAISE NOTICE '';
  RAISE NOTICE 'Itineraries created:';
  RAISE NOTICE '  1. Tokyo & Mount Fuji Adventure (7 days) - ID: %', v_itinerary_1;
  RAISE NOTICE '  2. Iceland Ring Road Adventure (10 days) - ID: %', v_itinerary_2;
  RAISE NOTICE '  3. Paris Long Weekend (3 days, private) - ID: %', v_itinerary_3;

END $$;
```

---

## After Running

To log in as the test user, you'll need to either:

1. **Create auth credentials** for `testuser@stashport.dev` via Supabase Auth
2. **Or** update the test user's `auth_id` to match your existing auth user:

```sql
-- Link test data to your real account
UPDATE users
SET auth_id = (SELECT id FROM auth.users WHERE email = 'your-real@email.com')
WHERE email = 'testuser@stashport.dev';

-- Or transfer itineraries to your account
UPDATE itineraries
SET user_id = (SELECT id FROM users WHERE email = 'your-real@email.com')
WHERE user_id = (SELECT id FROM users WHERE email = 'testuser@stashport.dev');
```

---

## Cleanup

```sql
-- Delete all test data
DELETE FROM users WHERE email = 'testuser@stashport.dev';
```
