
-- Create a function to check if username exists
CREATE OR REPLACE FUNCTION public.check_username_exists(username_to_check text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE LOWER(username) = LOWER(username_to_check)
  );
$$;

-- Add a unique constraint on username (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique_idx 
ON public.profiles (LOWER(username));

-- Update the handle_new_user function to validate username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_username text;
BEGIN
  user_username := NEW.raw_user_meta_data->>'username';
  
  -- Validate username doesn't contain spaces
  IF user_username IS NOT NULL AND user_username ~ '\s' THEN
    RAISE EXCEPTION 'Username cannot contain spaces';
  END IF;
  
  -- Check if username already exists
  IF user_username IS NOT NULL AND public.check_username_exists(user_username) THEN
    RAISE EXCEPTION 'Username already exists';
  END IF;
  
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    user_username,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;
