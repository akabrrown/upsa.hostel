-- Function to handle atomic room booking
-- This function prevents double bookings by locking the bed row
CREATE OR REPLACE FUNCTION book_room_atomic(
  p_user_id UUID,
  p_room_id UUID,
  p_bed_id UUID,
  p_semester VARCHAR,
  p_academic_year VARCHAR
) RETURNS JSON AS $$
DECLARE
  v_bed_number VARCHAR;
  v_affected_rows INTEGER;
  v_new_accommodation_id UUID;
  v_current_occupancy INTEGER;
BEGIN
  -- 1. Check if user already has an active accommodation for this period
  IF EXISTS (
    SELECT 1 FROM accommodations 
    WHERE user_id = p_user_id 
    AND academic_year = p_academic_year 
    AND semester = p_semester 
    AND is_active = true
  ) THEN
    RETURN json_build_object('success', false, 'message', 'You already have an active accommodation for this semester');
  END IF;

  -- 2. Check for pending or approved bookings
  IF EXISTS (
    SELECT 1 FROM bookings 
    WHERE user_id = p_user_id 
    AND academic_year = p_academic_year 
    AND semester = p_semester 
    AND status IN ('Pending', 'Approved')
  ) THEN
    RETURN json_build_object('success', false, 'message', 'You already have a pending or approved booking for this semester');
  END IF;

  -- 3. Check for pending or approved reservations
  IF EXISTS (
    SELECT 1 FROM reservations 
    WHERE user_id = p_user_id 
    AND academic_year = p_academic_year 
    AND semester = p_semester 
    AND status IN ('Pending', 'Approved', 'Confirmed')
  ) THEN
    RETURN json_build_object('success', false, 'message', 'You already have a pending or approved reservation for this semester');
  END IF;

  -- 4. Try to lock and update the bed
  -- We select the bed number first to ensure it exists and get data
  SELECT bed_number INTO v_bed_number 
  FROM beds 
  WHERE id = p_bed_id AND is_available = true 
  FOR UPDATE SKIP LOCKED; -- Try to lock, if already locked by another tx, skip (or we could wait)
  
  -- Actually, let's just try to update immediately. 
  -- If we want to strictly prevent race conditions, we update where is_available = true.
  
  
  UPDATE beds 
  SET is_available = false
  WHERE id = p_bed_id AND is_available = true
  RETURNING bed_number INTO v_bed_number;
  
  GET DIAGNOSTICS v_affected_rows = ROW_COUNT;
  
  IF v_affected_rows = 0 THEN
    RETURN json_build_object('success', false, 'message', 'Bed is no longer available');
  END IF;

  -- 5. Create accommodation record
  INSERT INTO accommodations (
    user_id,
    room_id,
    bed_number,
    semester,
    academic_year,
    allocation_date,
    is_active
  ) VALUES (
    p_user_id,
    p_room_id,
    v_bed_number,
    p_semester,
    p_academic_year,
    CURRENT_DATE,
    true
  ) RETURNING id INTO v_new_accommodation_id;

  -- 6. Update room occupancy
  UPDATE rooms 
  SET current_occupancy = current_occupancy + 1
  WHERE id = p_room_id;

  RETURN json_build_object(
    'success', true, 
    'message', 'Booking completed successfully',
    'data', json_build_object('accommodation_id', v_new_accommodation_id)
  );

EXCEPTION WHEN OTHERS THEN
  -- Should rollback automatically on error
  RAISE;
END;
$$ LANGUAGE plpgsql;
