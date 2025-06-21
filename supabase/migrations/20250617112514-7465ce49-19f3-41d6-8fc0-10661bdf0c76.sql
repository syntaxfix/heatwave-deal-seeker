
-- Fix RLS policies for root admin access
-- First, create policies for categories table
DROP POLICY IF EXISTS "Root admins can manage categories" ON public.categories;
CREATE POLICY "Root admins can manage categories" 
ON public.categories
FOR ALL 
USING (public.has_role(auth.uid(), 'root_admin'))
WITH CHECK (public.has_role(auth.uid(), 'root_admin'));

-- Create policies for shops table  
DROP POLICY IF EXISTS "Root admins can manage shops" ON public.shops;
CREATE POLICY "Root admins can manage shops" 
ON public.shops
FOR ALL 
USING (public.has_role(auth.uid(), 'root_admin'))
WITH CHECK (public.has_role(auth.uid(), 'root_admin'));

-- Create policies for tags table
DROP POLICY IF EXISTS "Root admins can manage tags" ON public.tags;
CREATE POLICY "Root admins can manage tags" 
ON public.tags
FOR ALL 
USING (public.has_role(auth.uid(), 'root_admin'))
WITH CHECK (public.has_role(auth.uid(), 'root_admin'));

-- Create policies for blog_posts table
DROP POLICY IF EXISTS "Root admins can manage blog posts" ON public.blog_posts;
CREATE POLICY "Root admins can manage blog posts" 
ON public.blog_posts
FOR ALL 
USING (public.has_role(auth.uid(), 'root_admin'))
WITH CHECK (public.has_role(auth.uid(), 'root_admin'));

-- Create policies for static_pages table
DROP POLICY IF EXISTS "Root admins can manage static pages" ON public.static_pages;
CREATE POLICY "Root admins can manage static pages" 
ON public.static_pages
FOR ALL 
USING (public.has_role(auth.uid(), 'root_admin'))
WITH CHECK (public.has_role(auth.uid(), 'root_admin'));

-- Create policies for coupons table
DROP POLICY IF EXISTS "Root admins can manage coupons" ON public.coupons;
CREATE POLICY "Root admins can manage coupons" 
ON public.coupons
FOR ALL 
USING (public.has_role(auth.uid(), 'root_admin'))
WITH CHECK (public.has_role(auth.uid(), 'root_admin'));

-- Create policies for deals table
DROP POLICY IF EXISTS "Root admins can manage deals" ON public.deals;
CREATE POLICY "Root admins can manage deals" 
ON public.deals
FOR ALL 
USING (public.has_role(auth.uid(), 'root_admin'))
WITH CHECK (public.has_role(auth.uid(), 'root_admin'));

-- Enable RLS on all tables that need it
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.static_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
