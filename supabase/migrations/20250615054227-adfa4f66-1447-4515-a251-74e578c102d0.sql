
-- First, let's check if we need to create the auth user
-- Insert a root admin user into auth.users (this will create the authentication account)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b52e1685-92ba-414b-8de3-11090f9e3928',
  'authenticated',
  'authenticated',
  'rootadmin@dealspark.com',
  crypt('RootAdmin123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Root Administrator", "username": "rootadmin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- Update the profiles table to ensure the root admin profile exists
INSERT INTO public.profiles (id, username, full_name, role)
VALUES (
  'b52e1685-92ba-414b-8de3-11090f9e3928'::uuid,
  'rootadmin',
  'Root Administrator',
  'root_admin'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'root_admin',
  username = 'rootadmin',
  full_name = 'Root Administrator';
