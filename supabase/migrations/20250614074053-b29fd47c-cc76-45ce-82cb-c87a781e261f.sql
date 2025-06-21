
-- First, let's check and update the role constraint to allow root_admin
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add updated constraint that includes root_admin
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'admin', 'moderator', 'root_admin'));

-- Now insert the initial root user profile
INSERT INTO public.profiles (id, username, full_name, role)
VALUES (
  'b52e1685-92ba-414b-8de3-11090f9e3928'::uuid,
  'fixcodeerror',
  'Root Administrator',
  'root_admin'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'root_admin',
  username = COALESCE(profiles.username, 'fixcodeerror'),
  full_name = COALESCE(profiles.full_name, 'Root Administrator');

-- Create user_roles table for better role management
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'user',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_roles
DROP POLICY IF EXISTS "Root admins can manage all user roles" ON public.user_roles;
CREATE POLICY "Root admins can manage all user roles"
  ON public.user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'root_admin'
    )
  );

-- Create function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role = _role
  )
$$;

-- Update deals table to add user_id foreign key reference if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'deals_user_id_fkey' 
    AND table_name = 'deals'
  ) THEN
    ALTER TABLE public.deals 
    ADD CONSTRAINT deals_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id);
  END IF;
END $$;

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Anyone can view approved deals" ON public.deals;
DROP POLICY IF EXISTS "Users can view own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can view their own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can create deals" ON public.deals;
DROP POLICY IF EXISTS "Users can insert their own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can update own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can update their own deals" ON public.deals;
DROP POLICY IF EXISTS "Admins can manage all deals" ON public.deals;
DROP POLICY IF EXISTS "Root admins can manage all deals" ON public.deals;

-- Create new policies for deals
CREATE POLICY "Anyone can view approved deals"
  ON public.deals
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can view their own deals"
  ON public.deals
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own deals"
  ON public.deals
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own deals"
  ON public.deals
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Root admins can manage all deals"
  ON public.deals
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'root_admin'
    )
  );

-- Enable RLS on deals if not already enabled
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
