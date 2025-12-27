-- Populate beds table based on room capacity
-- This script creates bed records for all rooms that don't have beds yet

-- First, let's see what we're working with
-- SELECT id, room_number, capacity, hostel_id FROM rooms WHERE is_active = true;

-- Generate beds for each room based on its capacity
INSERT INTO public.beds (room_id, bed_number, is_available)
SELECT 
    r.id as room_id,
    'Bed ' || generate_series as bed_number,
    true as is_available
FROM 
    public.rooms r,
    generate_series(1, r.capacity)
WHERE 
    r.is_active = true
    AND NOT EXISTS (
        SELECT 1 FROM public.beds b WHERE b.room_id = r.id
    )
ORDER BY r.id, generate_series;

-- Verify the results
-- SELECT r.room_number, r.capacity, COUNT(b.id) as bed_count
-- FROM rooms r
-- LEFT JOIN beds b ON b.room_id = r.id
-- GROUP BY r.id, r.room_number, r.capacity
-- ORDER BY r.room_number;
