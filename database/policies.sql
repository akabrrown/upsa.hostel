-- UPSA Hostel Management System - Row Level Security Policies
-- PostgreSQL RLS Policies
-- Created: December 20, 2025
-- Version: 1.0.0

-- ========================================
-- ENABLE RLS ON ALL TABLES
-- ========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ========================================
-- USERS TABLE POLICIES
-- ========================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- Admins can update all users
CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- Public can insert users (for signup)
CREATE POLICY "Public can insert users" ON users
    FOR INSERT WITH CHECK (true);

-- ========================================
-- PROFILES TABLE POLICIES
-- ========================================

-- Users can view their own profile data
CREATE POLICY "Users can view own profile data" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile data
CREATE POLICY "Users can update own profile data" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- Porters can view student profiles
CREATE POLICY "Porters can view student profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'porter'
        )
    );

-- Public can insert profiles (for signup)
CREATE POLICY "Public can insert profiles" ON profiles
    FOR INSERT WITH CHECK (true);

-- ========================================
-- ROLES AND PERMISSIONS POLICIES
-- ========================================

-- Everyone can view roles
CREATE POLICY "Everyone can view roles" ON roles
    FOR SELECT USING (true);

-- Everyone can view permissions
CREATE POLICY "Everyone can view permissions" ON permissions
    FOR SELECT USING (true);

-- Everyone can view role permissions
CREATE POLICY "Everyone can view role permissions" ON role_permissions
    FOR SELECT USING (true);

-- Only admins can modify roles (everyone can read)
CREATE POLICY "Only admins can modify roles" ON roles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'admin'
        )
    );

CREATE POLICY "Only admins can modify roles" ON roles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'admin'
        )
    );

CREATE POLICY "Only admins can modify roles" ON roles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- Only admins can modify permissions
CREATE POLICY "Only admins can modify permissions" ON permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- Only admins can modify role permissions
CREATE POLICY "Only admins can modify role permissions" ON role_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- ========================================
-- ACCOMMODATION TABLES POLICIES
-- ========================================

-- Everyone can view hostels
CREATE POLICY "Everyone can view hostels" ON hostels
    FOR SELECT USING (true);

-- Admins can modify hostels
CREATE POLICY "Admins can modify hostels" ON hostels
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- Porters can modify hostels
CREATE POLICY "Porters can modify hostels" ON hostels
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'porter'
        )
    );

-- Everyone can view rooms
CREATE POLICY "Everyone can view rooms" ON rooms
    FOR SELECT USING (true);

-- Admins can modify rooms
CREATE POLICY "Admins can modify rooms" ON rooms
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- Porters can modify rooms
CREATE POLICY "Porters can modify rooms" ON rooms
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'porter'
        )
    );

-- Users can view their own accommodations
CREATE POLICY "Users can view own accommodations" ON accommodations
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create accommodations
CREATE POLICY "Users can create accommodations" ON accommodations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own accommodations
CREATE POLICY "Users can update own accommodations" ON accommodations
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all accommodations
CREATE POLICY "Admins can view all accommodations" ON accommodations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- Admins can modify all accommodations
CREATE POLICY "Admins can modify all accommodations" ON accommodations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- Porters can view all accommodations
CREATE POLICY "Porters can view all accommodations" ON accommodations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'porter'
        )
    );

-- ========================================
-- BOOKING AND RESERVATION POLICIES
-- ========================================

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create bookings
CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings
CREATE POLICY "Users can update own bookings" ON bookings
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- Admins can modify all bookings
CREATE POLICY "Admins can modify all bookings" ON bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- Porters can view all bookings
CREATE POLICY "Porters can view all bookings" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'porter'
        )
    );

-- Porters can update bookings
CREATE POLICY "Porters can update bookings" ON bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'porter'
        )
    );

-- Similar policies for reservations
CREATE POLICY "Users can view own reservations" ON reservations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create reservations" ON reservations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all reservations" ON reservations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'admin'
        )
    );

CREATE POLICY "Porters can view all reservations" ON reservations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'porter'
        )
    );

-- ========================================
-- PAYMENT TABLES POLICIES
-- ========================================

-- Everyone can view payment methods
CREATE POLICY "Everyone can view payment methods" ON payment_methods
    FOR SELECT USING (true);

-- Only admins can modify payment methods
CREATE POLICY "Only admins can modify payment methods" ON payment_methods
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create payments
CREATE POLICY "Users can create payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- Porters can view all payments
CREATE POLICY "Porters can view all payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'porter'
        )
    );

-- ========================================
-- ACTIVITY TABLES POLICIES
-- ========================================

-- Users can view their own check-ins
CREATE POLICY "Users can view own checkins" ON checkins
    FOR SELECT USING (auth.uid() = user_id);

-- Porters can create check-ins
CREATE POLICY "Porters can create checkins" ON checkins
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'porter'
        )
    );

-- Admins can view all check-ins
CREATE POLICY "Admins can view all checkins" ON checkins
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- Porters can view all check-ins
CREATE POLICY "Porters can view all checkins" ON checkins
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'porter'
        )
    );

-- Similar policies for maintenance
CREATE POLICY "Users can view own maintenance requests" ON maintenance
    FOR SELECT USING (auth.uid() = reported_by);

CREATE POLICY "Users can create maintenance requests" ON maintenance
    FOR INSERT WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Admins can view all maintenance" ON maintenance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'admin'
        )
    );

CREATE POLICY "Porters can view all maintenance" ON maintenance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'porter'
        )
    );

-- ========================================
-- COMMUNICATION TABLES POLICIES
-- ========================================

-- Everyone can view announcements
CREATE POLICY "Everyone can view announcements" ON announcements
    FOR SELECT USING (true);

-- Admins and porters can create announcements
CREATE POLICY "Staff can create announcements" ON announcements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name IN ('admin', 'porter', 'director')
        )
    );

-- Admins can modify announcements
CREATE POLICY "Admins can modify announcements" ON announcements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- System can create notifications
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- ========================================
-- AUDIT LOGS POLICIES
-- ========================================

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- System can create audit logs
CREATE POLICY "System can create audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- ========================================
-- CREATE FUNCTIONS FOR ROLE CHECKS
-- ========================================

CREATE OR REPLACE FUNCTION user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT r.name 
        FROM roles r
        JOIN users u ON u.role_id = r.id
        WHERE u.id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has specific role
CREATE OR REPLACE FUNCTION has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT EXISTS (
            SELECT 1 
            FROM roles r
            JOIN users u ON u.role_id = r.id
            WHERE u.id = user_id AND r.name = role_name
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
