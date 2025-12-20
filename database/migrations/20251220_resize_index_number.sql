-- Migration to increase the size of index_number column in users table
-- Includes handling of dependent views

BEGIN;

-- 1. Drop dependent views
DROP VIEW IF EXISTS payment_summaries;
DROP VIEW IF EXISTS student_accommodations;
DROP VIEW IF EXISTS user_profiles;

-- 2. Alter the column size
ALTER TABLE users 
ALTER COLUMN index_number TYPE VARCHAR(20);

-- 3. Recreate user_profiles view
CREATE VIEW user_profiles AS
SELECT 
    u.id,
    u.email,
    u.index_number,
    u.is_active,
    r.name as role_name,
    p.first_name,
    p.last_name,
    p.phone_number,
    p.student_id,
    p.program,
    p.year_of_study,
    p.academic_year
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN profiles p ON u.id = p.user_id;

-- 4. Recreate student_accommodations view
CREATE VIEW student_accommodations AS
SELECT 
    a.id,
    u.index_number,
    p.first_name,
    p.last_name,
    h.name as hostel_name,
    r.room_number,
    a.bed_number,
    a.semester,
    a.academic_year,
    a.is_active,
    a.check_in_date,
    a.check_out_date
FROM accommodations a
JOIN users u ON a.user_id = u.id
JOIN profiles p ON u.id = p.user_id
JOIN rooms r ON a.room_id = r.id
JOIN hostels h ON r.hostel_id = h.id;

-- 5. Recreate payment_summaries view
CREATE VIEW payment_summaries AS
SELECT 
    u.index_number,
    p.first_name,
    p.last_name,
    py.semester,
    py.academic_year,
    SUM(py.amount) as total_paid,
    COUNT(py.id) as payment_count,
    py.status
FROM payments py
JOIN users u ON py.user_id = u.id
JOIN profiles p ON u.id = p.user_id
GROUP BY u.index_number, p.first_name, p.last_name, py.semester, py.academic_year, py.status;

COMMIT;
