-- Script to set up the first admin user
-- Run this AFTER creating your first admin user through the registration form

-- Replace 'admin@hospital.com' with the actual email of your admin user
-- This script should be run manually after the admin user registers

-- Example usage:
-- 1. Register a user with rol='admin' through the web interface
-- 2. Find the user ID and run this script

-- You can find the user ID with:
-- SELECT id FROM auth.users WHERE email = 'your-admin-email@hospital.com';

-- Then insert into admin_users:
-- INSERT INTO public.admin_users (user_id) 
-- SELECT id FROM auth.users WHERE email = 'your-admin-email@hospital.com'
-- ON CONFLICT (user_id) DO NOTHING;

-- Or you can create a function to do this automatically:
CREATE OR REPLACE FUNCTION setup_admin_user(admin_email TEXT)
RETURNS VOID AS $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Get the user ID
  SELECT id INTO user_uuid FROM auth.users WHERE email = admin_email;
  
  IF user_uuid IS NOT NULL THEN
    -- Insert into admin_users table
    INSERT INTO public.admin_users (user_id) VALUES (user_uuid)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Update the user's role to admin if not already
    UPDATE public.users SET rol = 'admin' WHERE id = user_uuid;
    
    RAISE NOTICE 'Admin user setup completed for %', admin_email;
  ELSE
    RAISE EXCEPTION 'User with email % not found', admin_email;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Usage example (uncomment and modify the email):
-- SELECT setup_admin_user('admin@hospital.com');
