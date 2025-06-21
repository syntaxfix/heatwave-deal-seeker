
-- Drop existing coupon policies to replace them with more inclusive ones
DROP POLICY IF EXISTS "Allow admin to read all coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow admin to create coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow admin to update coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow admin to delete coupons" ON public.coupons;

-- Allow admin and root_admin users to see all coupons
CREATE POLICY "Allow admins to read all coupons"
ON public.coupons
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'root_admin'));

-- Allow admin and root_admin users to insert coupons
CREATE POLICY "Allow admins to create coupons"
ON public.coupons
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'root_admin'));

-- Allow admin and root_admin users to update coupons
CREATE POLICY "Allow admins to update coupons"
ON public.coupons
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'root_admin'));

-- Allow admin and root_admin users to delete coupons
CREATE POLICY "Allow admins to delete coupons"
ON public.coupons
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'root_admin'));
