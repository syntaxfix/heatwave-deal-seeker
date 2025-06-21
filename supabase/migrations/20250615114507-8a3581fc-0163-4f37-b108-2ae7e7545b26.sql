
-- Drop the existing policy on system_settings to replace it with a more robust one
DROP POLICY IF EXISTS "Root admins can manage system settings" ON public.system_settings;

-- Recreate the policy using the has_role security definer function.
-- This is a more reliable way to check for user roles within RLS policies.
CREATE POLICY "Root admins can manage system settings" 
ON public.system_settings
FOR ALL 
USING (public.has_role(auth.uid(), 'root_admin'))
WITH CHECK (public.has_role(auth.uid(), 'root_admin'));
