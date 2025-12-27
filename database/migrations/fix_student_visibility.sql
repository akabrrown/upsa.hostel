-- Migration: Fix student visibility for hostels and rooms
-- Description: Creates missing beds table and ensures RLS policies are correct for student access.

-- 1. Create beds table if missing (needed by API)
CREATE TABLE IF NOT EXISTS public.beds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    bed_number TEXT NOT NULL,
    is_available BOOLEAN DEFAULT true,
    current_student_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on beds
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;

-- 2. Fix/Create RLS Policies for Student Visibility

-- Hostels: Everyone can view
DROP POLICY IF EXISTS "Everyone can view hostels" ON public.hostels;
CREATE POLICY "Everyone can view hostels" ON public.hostels
    FOR SELECT USING (true);

-- Rooms: Everyone can view
DROP POLICY IF EXISTS "Everyone can view rooms" ON public.rooms;
CREATE POLICY "Everyone can view rooms" ON public.rooms
    FOR SELECT USING (true);

-- Beds: Everyone can view
DROP POLICY IF EXISTS "Everyone can view beds" ON public.beds;
CREATE POLICY "Everyone can view beds" ON public.beds
    FOR SELECT USING (true);

-- 3. Ensure students can select their own accommodations/bookings
DROP POLICY IF EXISTS "Users can view own accommodations" ON public.accommodations;
CREATE POLICY "Users can view own accommodations" ON public.accommodations
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
CREATE POLICY "Users can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own reservations" ON public.reservations;
CREATE POLICY "Users can view own reservations" ON public.reservations
    FOR SELECT USING (auth.uid() = user_id);

-- 4. Grant Select on relevant tables to anon and authenticated
GRANT SELECT ON public.hostels TO anon, authenticated;
GRANT SELECT ON public.rooms TO anon, authenticated;
GRANT SELECT ON public.beds TO anon, authenticated;
GRANT SELECT ON public.system_settings TO anon, authenticated;
