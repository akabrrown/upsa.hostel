-- UPSA Hostel Management System Database Seeding Script
-- PostgreSQL Database Seeding
-- Created: December 19, 2025
-- Version: 1.0.0

-- ================================
-- INSERT INITIAL ROLES
-- ================================

INSERT INTO roles (name, description) VALUES
('student', 'Student user with access to room booking, payments, and announcements'),
('admin', 'System administrator with full access to all features'),
('porter', 'Hostel porter with access to check-in/out and room monitoring'),
('director', 'Director with strategic oversight and reporting access');

-- ================================
-- INSERT INITIAL PERMISSIONS
-- ================================

INSERT INTO permissions (name, description, resource, action) VALUES
-- User permissions
('users.view', 'View user profiles', 'users', 'read'),
('users.create', 'Create new users', 'users', 'create'),
('users.edit', 'Edit user information', 'users', 'update'),
('users.delete', 'Delete users', 'users', 'delete'),

-- Room permissions
('rooms.view', 'View room information', 'rooms', 'read'),
('rooms.create', 'Create new rooms', 'rooms', 'create'),
('rooms.edit', 'Edit room details', 'rooms', 'update'),
('rooms.delete', 'Delete rooms', 'rooms', 'delete'),

-- Booking permissions
('bookings.view', 'View bookings', 'bookings', 'read'),
('bookings.create', 'Create new bookings', 'bookings', 'create'),
('bookings.edit', 'Edit bookings', 'bookings', 'update'),
('bookings.delete', 'Delete bookings', 'bookings', 'delete'),
('bookings.approve', 'Approve booking requests', 'bookings', 'approve'),

-- Reservation permissions
('reservations.view', 'View reservations', 'reservations', 'read'),
('reservations.create', 'Create new reservations', 'reservations', 'create'),
('reservations.edit', 'Edit reservations', 'reservations', 'update'),
('reservations.delete', 'Delete reservations', 'reservations', 'delete'),
('reservations.approve', 'Approve reservation requests', 'reservations', 'approve'),

-- Payment permissions
('payments.view', 'View payment records', 'payments', 'read'),
('payments.create', 'Create payment records', 'payments', 'create'),
('payments.edit', 'Edit payment records', 'payments', 'update'),
('payments.process', 'Process payments', 'payments', 'process'),

-- Announcement permissions
('announcements.view', 'View announcements', 'announcements', 'read'),
('announcements.create', 'Create announcements', 'announcements', 'create'),
('announcements.edit', 'Edit announcements', 'announcements', 'update'),
('announcements.delete', 'Delete announcements', 'announcements', 'delete'),
('announcements.publish', 'Publish announcements', 'announcements', 'publish'),

-- Maintenance permissions
('maintenance.view', 'View maintenance requests', 'maintenance', 'read'),
('maintenance.create', 'Create maintenance requests', 'maintenance', 'create'),
('maintenance.edit', 'Edit maintenance requests', 'maintenance', 'update'),
('maintenance.resolve', 'Resolve maintenance requests', 'maintenance', 'resolve'),

-- Check-in permissions
('checkins.view', 'View check-in records', 'checkins', 'read'),
('checkins.create', 'Create check-in records', 'checkins', 'create'),
('checkins.edit', 'Edit check-in records', 'checkins', 'update'),

-- Reports permissions
('reports.view', 'View system reports', 'reports', 'read'),
('reports.generate', 'Generate system reports', 'reports', 'generate'),

-- System permissions
('system.settings', 'Access system settings', 'system', 'read'),
('system.audit', 'View audit logs', 'system', 'audit');

-- ================================
-- ASSIGN PERMISSIONS TO ROLES
-- ================================

-- Student permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'student' AND p.name IN (
    'users.view', 'rooms.view', 'bookings.view', 'bookings.create', 'reservations.view', 
    'reservations.create', 'payments.view', 'announcements.view', 'maintenance.create',
    'checkins.view'
);

-- Porter permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'porter' AND p.name IN (
    'users.view', 'rooms.view', 'rooms.edit', 'bookings.view', 'reservations.view',
    'payments.view', 'announcements.view', 'announcements.create', 'maintenance.view',
    'maintenance.create', 'maintenance.edit', 'maintenance.resolve', 'checkins.view',
    'checkins.create', 'checkins.edit', 'reports.view'
);

-- Admin permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'admin' AND p.name IN (
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'rooms.view', 'rooms.create', 'rooms.edit', 'rooms.delete',
    'bookings.view', 'bookings.create', 'bookings.edit', 'bookings.delete', 'bookings.approve',
    'reservations.view', 'reservations.create', 'reservations.edit', 'reservations.delete', 'reservations.approve',
    'payments.view', 'payments.create', 'payments.edit', 'payments.process',
    'announcements.view', 'announcements.create', 'announcements.edit', 'announcements.delete', 'announcements.publish',
    'maintenance.view', 'maintenance.create', 'maintenance.edit', 'maintenance.resolve',
    'checkins.view', 'checkins.create', 'checkins.edit',
    'reports.view', 'reports.generate', 'system.settings', 'system.audit'
);

-- Director permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'director' AND p.name IN (
    'users.view', 'rooms.view', 'bookings.view', 'reservations.view',
    'payments.view', 'announcements.view', 'announcements.create', 'announcements.publish',
    'maintenance.view', 'checkins.view', 'reports.view', 'reports.generate', 'system.audit'
);

-- ================================
-- INSERT PAYMENT METHODS
-- ================================

INSERT INTO payment_methods (name, description) VALUES
('Bank Transfer', 'Direct bank transfer to hostel account'),
('Mobile Money', 'Mobile money payment (MTN, Vodafone, AirtelTigo)'),
('Credit Card', 'Credit or debit card payment'),
('Cash', 'Cash payment at hostel office');

-- ================================
-- INSERT SAMPLE HOSTELS
-- ================================

INSERT INTO hostels (name, code, description, address, total_floors, warden_name, warden_contact) VALUES
('Main Hall', 'MH', 'Main hostel building with modern facilities', 'UPSA Campus, Accra', 4, 'Mr. Kwame Asante', '+233-244-123-456'),
('Annex A', 'AXA', 'Annex building for female students', 'UPSA Campus, Accra', 3, 'Mrs. Ama Mensah', '+233-244-789-012'),
('Annex B', 'AXB', 'Annex building for male students', 'UPSA Campus, Accra', 3, 'Mr. Yaw Boateng', '+233-244-345-678'),
('Graduate Hall', 'GH', 'Postgraduate student accommodation', 'UPSA Campus, Accra', 2, 'Dr. Grace Osei', '+233-244-901-234');

-- ================================
-- INSERT SAMPLE ROOMS
-- ================================

-- Main Hall Rooms
INSERT INTO rooms (hostel_id, room_number, floor_number, room_type, capacity, price_per_semester, amenities) VALUES
((SELECT id FROM hostels WHERE code = 'MH'), '101', 1, 'Single', 1, 1500.00, ARRAY['Bed', 'Desk', 'Chair', 'Wardrobe', 'AC', 'WiFi']),
((SELECT id FROM hostels WHERE code = 'MH'), '102', 1, 'Double', 2, 900.00, ARRAY['Bed x2', 'Desk x2', 'Chair x2', 'Wardrobe x2', 'Fan', 'WiFi']),
((SELECT id FROM hostels WHERE code = 'MH'), '103', 1, 'Double', 2, 900.00, ARRAY['Bed x2', 'Desk x2', 'Chair x2', 'Wardrobe x2', 'Fan', 'WiFi']),
((SELECT id FROM hostels WHERE code = 'MH'), '104', 1, 'Triple', 3, 700.00, ARRAY['Bed x3', 'Desk x3', 'Chair x3', 'Wardrobe x3', 'Fan', 'WiFi']),
((SELECT id FROM hostels WHERE code = 'MH'), '201', 2, 'Single', 1, 1500.00, ARRAY['Bed', 'Desk', 'Chair', 'Wardrobe', 'AC', 'WiFi']),
((SELECT id FROM hostels WHERE code = 'MH'), '202', 2, 'Double', 2, 900.00, ARRAY['Bed x2', 'Desk x2', 'Chair x2', 'Wardrobe x2', 'Fan', 'WiFi']),
((SELECT id FROM hostels WHERE code = 'MH'), '203', 2, 'Double', 2, 900.00, ARRAY['Bed x2', 'Desk x2', 'Chair x2', 'Wardrobe x2', 'Fan', 'WiFi']),
((SELECT id FROM hostels WHERE code = 'MH'), '204', 2, 'Triple', 3, 700.00, ARRAY['Bed x3', 'Desk x3', 'Chair x3', 'Wardrobe x3', 'Fan', 'WiFi']);

-- Annex A Rooms (Female)
INSERT INTO rooms (hostel_id, room_number, floor_number, room_type, capacity, price_per_semester, amenities) VALUES
((SELECT id FROM hostels WHERE code = 'AXA'), 'A101', 1, 'Double', 2, 850.00, ARRAY['Bed x2', 'Desk x2', 'Chair x2', 'Wardrobe x2', 'Fan', 'WiFi', 'Kitchen']),
((SELECT id FROM hostels WHERE code = 'AXA'), 'A102', 1, 'Double', 2, 850.00, ARRAY['Bed x2', 'Desk x2', 'Chair x2', 'Wardrobe x2', 'Fan', 'WiFi', 'Kitchen']),
((SELECT id FROM hostels WHERE code = 'AXA'), 'A103', 1, 'Triple', 3, 650.00, ARRAY['Bed x3', 'Desk x3', 'Chair x3', 'Wardrobe x3', 'Fan', 'WiFi', 'Kitchen']),
((SELECT id FROM hostels WHERE code = 'AXA'), 'A201', 2, 'Double', 2, 850.00, ARRAY['Bed x2', 'Desk x2', 'Chair x2', 'Wardrobe x2', 'Fan', 'WiFi', 'Kitchen']),
((SELECT id FROM hostels WHERE code = 'AXA'), 'A202', 2, 'Double', 2, 850.00, ARRAY['Bed x2', 'Desk x2', 'Chair x2', 'Wardrobe x2', 'Fan', 'WiFi', 'Kitchen']);

-- Annex B Rooms (Male)
INSERT INTO rooms (hostel_id, room_number, floor_number, room_type, capacity, price_per_semester, amenities) VALUES
((SELECT id FROM hostels WHERE code = 'AXB'), 'B101', 1, 'Double', 2, 850.00, ARRAY['Bed x2', 'Desk x2', 'Chair x2', 'Wardrobe x2', 'Fan', 'WiFi', 'Kitchen']),
((SELECT id FROM hostels WHERE code = 'AXB'), 'B102', 1, 'Double', 2, 850.00, ARRAY['Bed x2', 'Desk x2', 'Chair x2', 'Wardrobe x2', 'Fan', 'WiFi', 'Kitchen']),
((SELECT id FROM hostels WHERE code = 'AXB'), 'B103', 1, 'Triple', 3, 650.00, ARRAY['Bed x3', 'Desk x3', 'Chair x3', 'Wardrobe x3', 'Fan', 'WiFi', 'Kitchen']),
((SELECT id FROM hostels WHERE code = 'AXB'), 'B201', 2, 'Double', 2, 850.00, ARRAY['Bed x2', 'Desk x2', 'Chair x2', 'Wardrobe x2', 'Fan', 'WiFi', 'Kitchen']),
((SELECT id FROM hostels WHERE code = 'AXB'), 'B202', 2, 'Double', 2, 850.00, ARRAY['Bed x2', 'Desk x2', 'Chair x2', 'Wardrobe x2', 'Fan', 'WiFi', 'Kitchen']);

-- Graduate Hall Rooms
INSERT INTO rooms (hostel_id, room_number, floor_number, room_type, capacity, price_per_semester, amenities) VALUES
((SELECT id FROM hostels WHERE code = 'GH'), 'G101', 1, 'Single', 1, 2000.00, ARRAY['Bed', 'Desk', 'Chair', 'Wardrobe', 'AC', 'WiFi', 'Kitchen', 'Bathroom']),
((SELECT id FROM hostels WHERE code = 'GH'), 'G102', 1, 'Single', 1, 2000.00, ARRAY['Bed', 'Desk', 'Chair', 'Wardrobe', 'AC', 'WiFi', 'Kitchen', 'Bathroom']),
((SELECT id FROM hostels WHERE code = 'GH'), 'G103', 1, 'Suite', 2, 2500.00, ARRAY['Bed x2', 'Desk x2', 'Chair x2', 'Wardrobe x2', 'AC', 'WiFi', 'Kitchen', 'Bathroom', 'Living Room']),
((SELECT id FROM hostels WHERE code = 'GH'), 'G201', 2, 'Single', 1, 2000.00, ARRAY['Bed', 'Desk', 'Chair', 'Wardrobe', 'AC', 'WiFi', 'Kitchen', 'Bathroom']);

-- ================================
-- INSERT SAMPLE ADMIN USERS
-- ================================

-- Create admin users (password: admin123)
INSERT INTO users (email, password_hash, role_id, is_active) VALUES
('admin@upsamail.edu.gh', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', (SELECT id FROM roles WHERE name = 'admin'), true),
('director@upsamail.edu.gh', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', (SELECT id FROM roles WHERE name = 'director'), true),
('porter1@upsamail.edu.gh', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', (SELECT id FROM roles WHERE name = 'porter'), true),
('porter2@upsamail.edu.gh', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', (SELECT id FROM roles WHERE name = 'porter'), true);

-- Create admin profiles
INSERT INTO profiles (user_id, first_name, last_name, phone_number, student_id, program, year_of_study) VALUES
((SELECT id FROM users WHERE email = 'admin@upsamail.edu.gh'), 'System', 'Administrator', '+233-200-000-001', 'ADMIN001', 'System Administration', 1),
((SELECT id FROM users WHERE email = 'director@upsamail.edu.gh'), 'Director', 'General', '+233-200-000-002', 'DIR001', 'Hostel Management', 1),
((SELECT id FROM users WHERE email = 'porter1@upsamail.edu.gh'), 'Porter', 'One', '+233-200-000-003', 'PORTER001', 'Hostel Services', 1),
((SELECT id FROM users WHERE email = 'porter2@upsamail.edu.gh'), 'Porter', 'Two', '+233-200-000-004', 'PORTER002', 'Hostel Services', 1);

-- ================================
-- INSERT SAMPLE ANNOUNCEMENTS
-- ================================

INSERT INTO announcements (title, content, category, priority, target_audience, author_id, publication_date, is_published) VALUES
('Welcome to UPSA Hostel Management System', 'Welcome to the new UPSA Hostel Management System. Students can now book rooms online, make payments, and view announcements.', 'General', 'High', 'All', (SELECT id FROM users WHERE email = 'admin@upsamail.edu.gh'), CURRENT_TIMESTAMP, true),
('Room Booking Now Open for 2024/2025 Academic Year', 'Room booking for the 2024/2025 academic year is now open. Please log in to book your preferred room.', 'Academic', 'High', 'Students', (SELECT id FROM users WHERE email = 'admin@upsamail.edu.gh'), CURRENT_TIMESTAMP, true),
('Payment Deadline Reminder', 'All students are reminded to complete their hostel fee payments by the end of this month to avoid late payment penalties.', 'Payment', 'Medium', 'Students', (SELECT id FROM users WHERE email = 'admin@upsamail.edu.gh'), CURRENT_TIMESTAMP, true),
('Scheduled Maintenance - Main Hall', 'Main Hall will undergo maintenance this weekend. Students in affected rooms will be temporarily relocated.', 'Maintenance', 'High', 'Students', (SELECT id FROM users WHERE email = 'porter1@upsamail.edu.gh'), CURRENT_TIMESTAMP, true);

-- ================================
-- INSERT SAMPLE MAINTENANCE REQUESTS
-- ================================

INSERT INTO maintenance (room_id, reported_by, issue_type, description, priority, status) VALUES
((SELECT id FROM rooms WHERE room_number = '101' AND hostel_id = (SELECT id FROM hostels WHERE code = 'MH')), (SELECT id FROM users WHERE email = 'porter1@upsamail.edu.gh'), 'Plumbing', 'Leaking faucet in bathroom', 'Medium', 'Open'),
((SELECT id FROM rooms WHERE room_number = 'A102' AND hostel_id = (SELECT id FROM hostels WHERE code = 'AXA')), (SELECT id FROM users WHERE email = 'porter1@upsamail.edu.gh'), 'Electrical', 'Light bulb not working', 'Low', 'Open'),
((SELECT id FROM rooms WHERE room_number = 'B103' AND hostel_id = (SELECT id FROM hostels WHERE code = 'AXB')), (SELECT id FROM users WHERE email = 'porter2@upsamail.edu.gh'), 'Furniture', 'Broken chair leg', 'Medium', 'In Progress');

-- ================================
-- UPDATE ROOM CURRENT OCCUPANCY (SIMULATED)
-- ================================

-- Simulate some room occupancy
UPDATE rooms SET current_occupancy = 1 WHERE room_number = '101' AND hostel_id = (SELECT id FROM hostels WHERE code = 'MH');
UPDATE rooms SET current_occupancy = 2 WHERE room_number = '102' AND hostel_id = (SELECT id FROM hostels WHERE code = 'MH');
UPDATE rooms SET current_occupancy = 2 WHERE room_number = 'A101' AND hostel_id = (SELECT id FROM hostels WHERE code = 'AXA');
UPDATE rooms SET current_occupancy = 1 WHERE room_number = 'G101' AND hostel_id = (SELECT id FROM hostels WHERE code = 'GH');

-- ================================
-- SEEDING COMPLETE
-- ================================

-- Display summary
DO $$
DECLARE
    role_count INTEGER;
    permission_count INTEGER;
    payment_method_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO role_count FROM roles;
    SELECT COUNT(*) INTO permission_count FROM permissions;
    SELECT COUNT(*) INTO payment_method_count FROM payment_methods;
    
    RAISE NOTICE 'Database seeding completed successfully!';
    RAISE NOTICE 'Roles created: %', role_count;
    RAISE NOTICE 'Permissions created: %', permission_count;
    RAISE NOTICE 'Payment methods created: %', payment_method_count;
END $$;
