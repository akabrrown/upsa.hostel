-- DANGER: This script will delete the user 'akayetb@upsamail.edu.gh' 
-- from BOTH auth and public tables to fix corruption.

DO $$
DECLARE
    target_id UUID;
BEGIN
    -- 1. Find the ID from auth.users (if it exists)
    SELECT id INTO target_id FROM auth.users WHERE email = 'akayetb@upsamail.edu.gh';
    
    IF target_id IS NOT NULL THEN
        RAISE NOTICE 'Found user ID in auth.users: %', target_id;
        
        -- 2. Delete from auth.identities
        DELETE FROM auth.identities WHERE user_id = target_id;
        
        -- 3. Delete from auth.users
        DELETE FROM auth.users WHERE id = target_id;
        
        RAISE NOTICE 'Deleted user from auth tables.';
    ELSE
        RAISE NOTICE 'User not found in auth.users by email.';
    END IF;

    -- 4. Clean up public tables just in case
    DELETE FROM public.profiles WHERE user_id IN (SELECT id FROM public.users WHERE email = 'akayetb@upsamail.edu.gh');
    DELETE FROM public.users WHERE email = 'akayetb@upsamail.edu.gh';
    
    RAISE NOTICE 'Cleanup complete.';
END $$;
