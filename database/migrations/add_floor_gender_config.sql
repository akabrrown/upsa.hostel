-- Migration: Add floor gender configuration support
-- Created: 2025-12-25
-- Description: Adds floor_gender_config to hostels table and gender column to rooms table

-- Add floor gender configuration to hostels table
ALTER TABLE hostels ADD COLUMN IF NOT EXISTS floor_gender_config JSONB DEFAULT '{}';

-- Add gender column to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'mixed'));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_rooms_gender ON rooms(gender);

-- Add comment for documentation
COMMENT ON COLUMN hostels.floor_gender_config IS 'JSON mapping of floor numbers to gender (e.g., {"1": "male", "2": "female"})';
COMMENT ON COLUMN rooms.gender IS 'Gender designation for the room (male, female, or mixed)';
