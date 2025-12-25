-- Create hostel_page_content table for managing about-hostel page content
-- This table stores all the dynamic content for the about-hostel page

-- Drop table if it exists (for development)
DROP TABLE IF EXISTS public.hostel_page_content CASCADE;

-- Create the hostel_page_content table
CREATE TABLE public.hostel_page_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Hero section content
    hero_title TEXT NOT NULL DEFAULT 'Discover Our Hostels',
    hero_subtitle TEXT NOT NULL DEFAULT 'Experience world-class hostel facilities designed to provide comfort, security, and an environment conducive to academic excellence.',
    hero_background_image TEXT NOT NULL DEFAULT 'https://upsa.edu.gh/wp-content/uploads/2020/08/slide-7.jpg',
    hero_button_text TEXT NOT NULL DEFAULT 'Explore Hostels',
    
    -- Features section content
    features_title TEXT NOT NULL DEFAULT 'Why Choose UPSA Hostels?',
    features_subtitle TEXT NOT NULL DEFAULT 'We provide quality accommodation with modern amenities to ensure your comfort and academic success.',
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Call-to-action section content
    cta_title TEXT NOT NULL DEFAULT 'Ready to Join Our Community?',
    cta_subtitle TEXT NOT NULL DEFAULT 'Take the first step towards comfortable and secure hostel living. Apply now and secure your place in our vibrant student community.',
    cta_button_text TEXT NOT NULL DEFAULT 'Apply for Hostel',
    cta_secondary_button_text TEXT NOT NULL DEFAULT 'Contact Us',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.hostel_page_content ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for admin use)
-- This allows any authenticated user to perform CRUD operations
DROP POLICY IF EXISTS "hostel_page_content_policy" ON public.hostel_page_content;
CREATE POLICY "hostel_page_content_policy" ON public.hostel_page_content
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.hostel_page_content TO authenticated;
GRANT ALL ON public.hostel_page_content TO service_role;
GRANT SELECT ON public.hostel_page_content TO anon;

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hostel_page_content_updated_at
    BEFORE UPDATE ON public.hostel_page_content
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create index for better performance
CREATE INDEX idx_hostel_page_content_created_at ON public.hostel_page_content(created_at DESC);
CREATE INDEX idx_hostel_page_content_updated_at ON public.hostel_page_content(updated_at DESC);

-- Add comments for documentation
COMMENT ON TABLE public.hostel_page_content IS 'Stores dynamic content for the about-hostel page including hero section, features, and call-to-action content';
COMMENT ON COLUMN public.hostel_page_content.hero_title IS 'Main title displayed in the hero section';
COMMENT ON COLUMN public.hostel_page_content.hero_subtitle IS 'Subtitle text displayed in the hero section';
COMMENT ON COLUMN public.hostel_page_content.hero_background_image IS 'URL for the hero section background image';
COMMENT ON COLUMN public.hostel_page_content.hero_button_text IS 'Text for the primary button in hero section';
COMMENT ON COLUMN public.hostel_page_content.features_title IS 'Title for the features section';
COMMENT ON COLUMN public.hostel_page_content.features_subtitle IS 'Subtitle for the features section';
COMMENT ON COLUMN public.hostel_page_content.features IS 'JSON array of feature items with title, description, icon, and order';
COMMENT ON COLUMN public.hostel_page_content.cta_title IS 'Title for the call-to-action section';
COMMENT ON COLUMN public.hostel_page_content.cta_subtitle IS 'Subtitle for the call-to-action section';
COMMENT ON COLUMN public.hostel_page_content.cta_button_text IS 'Text for the primary CTA button';
COMMENT ON COLUMN public.hostel_page_content.cta_secondary_button_text IS 'Text for the secondary CTA button';
