-- Create system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON public.system_settings;
DROP POLICY IF EXISTS "Allow admin update access" ON public.system_settings;

-- Create policy for public read access (anon/authenticated)
CREATE POLICY "Allow public read access" ON public.system_settings
    FOR SELECT USING (true);

-- Create policy for admin update access
CREATE POLICY "Allow admin update access" ON public.system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            JOIN public.roles ON users.role_id = roles.id
            WHERE users.id = auth.uid()
            AND roles.name IN ('admin', 'director')
        )
    );

-- Insert initial values
INSERT INTO public.system_settings (key, value, description)
VALUES 
    ('booking_enabled', 'true'::jsonb, 'Toggle for the direct booking system'),
    ('reservation_enabled', 'true'::jsonb, 'Toggle for the reservation request system'),
    ('current_academic_year', '"2024/2025"'::jsonb, 'Current academic year'),
    ('current_semester', '"First Semester"'::jsonb, 'Current semester')
ON CONFLICT (key) DO NOTHING;
