
-- This migration corrects the role for the 'rootadmin' user, restoring it to 'root_admin'.
-- This is necessary to fix permissions for managing system settings.
UPDATE public.profiles
SET role = 'root_admin'
WHERE username = 'rootadmin' AND role = 'admin';
