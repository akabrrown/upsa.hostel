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
