-- Fix RLS policies for roles table to prevent infinite recursion
-- Drop all existing policies on roles table
DROP POLICY IF EXISTS "Everyone can view roles" ON roles;
DROP POLICY IF EXISTS "Only admins can modify roles" ON roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON roles;
DROP POLICY IF EXISTS "Admins can update roles" ON roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON roles;

-- Create new policies that don't cause recursion
-- Everyone can view roles (this is reference data)
CREATE POLICY "Everyone can view roles" ON roles
    FOR SELECT USING (true);

-- Only admins can insert roles
CREATE POLICY "Admins can insert roles" ON roles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u
            JOIN roles r ON u.role_id = r.id  
            WHERE u.id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- Only admins can update roles
CREATE POLICY "Admins can update roles" ON roles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN roles r ON u.role_id = r.id  
            WHERE u.id = auth.uid()
            AND r.name = 'admin'
        )
    );

-- Only admins can delete roles
CREATE POLICY "Admins can delete roles" ON roles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN roles r ON u.role_id = r.id  
            WHERE u.id = auth.uid()
            AND r.name = 'admin'
        )
    );
