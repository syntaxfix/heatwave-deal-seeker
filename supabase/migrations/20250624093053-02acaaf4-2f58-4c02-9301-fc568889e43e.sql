
-- Create subscribers table
CREATE TABLE public.subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  source TEXT DEFAULT 'popup',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access to subscribers
CREATE POLICY "Admin can manage subscribers" 
  ON public.subscribers 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'root_admin', 'moderator')
    )
  );

-- Create policy for public to insert (for the popup form)
CREATE POLICY "Anyone can subscribe" 
  ON public.subscribers 
  FOR INSERT 
  WITH CHECK (true);

-- Update the dashboard counts function to include subscribers
CREATE OR REPLACE FUNCTION public.get_dashboard_counts()
RETURNS json
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  counts json;
BEGIN
  SELECT json_build_object(
    'deals', (SELECT count(*) FROM public.deals),
    'users', (SELECT count(*) FROM public.profiles),
    'categories', (SELECT count(*) FROM public.categories),
    'tags', (SELECT count(*) FROM public.tags),
    'shops', (SELECT count(*) FROM public.shops),
    'blogPosts', (SELECT count(*) FROM public.blog_posts),
    'staticPages', (SELECT count(*) FROM public.static_pages),
    'coupons', (SELECT count(*) FROM public.coupons),
    'subscribers', (SELECT count(*) FROM public.subscribers WHERE is_active = true)
  ) INTO counts;
  RETURN counts;
END;
$$;
