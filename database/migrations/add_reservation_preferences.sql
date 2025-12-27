-- Migration to add student preferences to reservations table
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS preferred_hostel_id UUID REFERENCES hostels(id),
ADD COLUMN IF NOT EXISTS preferred_floor_id UUID,
ADD COLUMN IF NOT EXISTS preferred_room_type_id UUID,
ADD COLUMN IF NOT EXISTS special_requests TEXT;

-- Index for better join performance
CREATE INDEX IF NOT EXISTS idx_reservations_pref_hostel ON reservations(preferred_hostel_id);
