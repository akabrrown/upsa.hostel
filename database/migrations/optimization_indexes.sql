-- Indexes for high-performance booking lookups

-- 1. Accommodations: Frequent check for "User has active accommodation?"
CREATE INDEX IF NOT EXISTS idx_accommodations_user_active 
ON accommodations(user_id, academic_year, semester) 
WHERE is_active = true;

-- 2. Beds: Frequent check for "Is bed X available?" and "List available beds in room Y"
CREATE INDEX IF NOT EXISTS idx_beds_room_available 
ON beds(room_id, is_available);

CREATE INDEX IF NOT EXISTS idx_beds_available 
ON beds(id) 
WHERE is_available = true;

-- 3. Bookings: Frequent check for "User has pending booking?"
CREATE INDEX IF NOT EXISTS idx_bookings_user_status 
ON bookings(user_id, academic_year, semester) 
WHERE status IN ('Pending', 'Approved');

-- 4. Reservations: Frequent check for "User has pending reservation?"
CREATE INDEX IF NOT EXISTS idx_reservations_user_status 
ON reservations(user_id, academic_year, semester) 
WHERE status IN ('Pending', 'Approved', 'Confirmed');

-- 5. Rooms: Occupancy updates
CREATE INDEX IF NOT EXISTS idx_rooms_occupancy 
ON rooms(id, current_occupancy);
