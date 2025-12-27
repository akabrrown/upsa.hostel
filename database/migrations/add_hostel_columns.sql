-- Migration: Add missing columns to hostels table
-- Created: 2025-12-25
-- Description: Adds amenities, warden_email, warden_phone, room_pricing, and gender columns to hostels table

-- Add amenities column (array of text)
ALTER TABLE hostels ADD COLUMN IF NOT EXISTS amenities TEXT[];

-- Add warden email and phone columns
ALTER TABLE hostels ADD COLUMN IF NOT EXISTS warden_email VARCHAR(255);
ALTER TABLE hostels ADD COLUMN IF NOT EXISTS warden_phone VARCHAR(20);

-- Add room pricing column (JSONB for flexible pricing structure)
ALTER TABLE hostels ADD COLUMN IF NOT EXISTS room_pricing JSONB DEFAULT '{}';

-- Add gender column
ALTER TABLE hostels ADD COLUMN IF NOT EXISTS gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'mixed'));

-- Add comments for documentation
COMMENT ON COLUMN hostels.amenities IS 'Array of amenities available in the hostel (e.g., WiFi, Security, Parking)';
COMMENT ON COLUMN hostels.warden_email IS 'Email address of the hostel warden';
COMMENT ON COLUMN hostels.warden_phone IS 'Phone number of the hostel warden';
COMMENT ON COLUMN hostels.room_pricing IS 'JSON object containing pricing for different room types (single, double, quadruple)';
COMMENT ON COLUMN hostels.gender IS 'Gender designation for the hostel (male, female, or mixed)';
