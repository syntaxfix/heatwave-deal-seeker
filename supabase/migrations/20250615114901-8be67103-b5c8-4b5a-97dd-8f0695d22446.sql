
-- Update the has_role function to check both the profiles and user_roles tables.
-- This makes role checking more robust and covers cases where roles are in either table.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = _user_id AND role = _role
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$function$;

-- Drop all existing policies on system_settings to avoid conflicts and ensure a clean slate.
DROP POLICY IF EXISTS "Root admins can view system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Root admins can insert system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Root admins can update system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Root admins can delete system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Root admins can manage system settings" ON public.system_settings;


-- Recreate a single, comprehensive policy for all actions using the updated has_role function.
CREATE POLICY "Root admins can manage system settings"
ON public.system_settings FOR ALL
USING (public.has_role(auth.uid(), 'root_admin'))
WITH CHECK (public.has_role(auth.uid(), 'root_admin'));
