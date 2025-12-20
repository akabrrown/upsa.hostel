-- Create Admin User: akayetb@upsamail.edu.gh
-- Password: Option#4

DO $$
DECLARE
    new_user_id UUID := gen_random_uuid();
    admin_role_id INTEGER;
BEGIN
    -- Get the Admin role ID
    SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
    
    IF admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Admin role not found in roles table';
    END IF;

    -- 1. Insert into auth.users (Supabase Auth)
    -- Note: This assumes standard Supabase auth schema
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        aud,
        role,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin
    ) VALUES (
        new_user_id,
        '00000000-0000-0000-0000-000000000000',
        'akayetb@upsamail.edu.gh',
        '$2b$10$AvXWvOeTaaXWpKifPqLNhIyF8HjkF62f5wiTdowP', -- Hashed 'Option#4'
        now(),
        now(),
        now(),
        'authenticated',
        'authenticated',
        '{"provider": "email", "providers": ["email"]}',
        '{"firstName": "Admin", "lastName": "User", "role": "admin"}',
        false
    );

    -- 2. Insert into auth.identities
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        new_user_id,
        format('{"sub": "%s", "email": "%s"}', new_user_id, 'akayetb@upsamail.edu.gh')::jsonb,
        'email',
        new_user_id::text, -- In Supabase, provider_id for email is the user UUID
        now(),
        now(),
        now()
    );

    -- 3. Insert into public.users (App User Table)
    INSERT INTO public.users (
        id,
        email,
        password_hash,
        role_id,
        is_active,
        email_verified,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        'akayetb@upsamail.edu.gh',
        '$2b$10$AvXWvOeTaaXWpKifPqLNhIyF8HjkF62f5wiTdowP',
        admin_role_id,
        true,
        true,
        now(),
        now()
    );

    -- 4. Insert into public.profiles (User Profile)
    INSERT INTO public.profiles (
        user_id,
        first_name,
        last_name,
        student_id,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        'Admin',
        'User',
        'ADM-AKAYETB',
        now(),
        now()
    );

    RAISE NOTICE 'Admin user created successfully with ID: %', new_user_id;
END $$;
