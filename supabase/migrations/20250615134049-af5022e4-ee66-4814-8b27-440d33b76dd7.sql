
-- Enable Row Level Security for the coupons table
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Allow admin users to see all coupons
CREATE POLICY "Allow admin to read all coupons"
ON public.coupons
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admin users to insert coupons
CREATE POLICY "Allow admin to create coupons"
ON public.coupons
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admin users to update coupons
CREATE POLICY "Allow admin to update coupons"
ON public.coupons
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admin users to delete coupons
CREATE POLICY "Allow admin to delete coupons"
ON public.coupons
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
