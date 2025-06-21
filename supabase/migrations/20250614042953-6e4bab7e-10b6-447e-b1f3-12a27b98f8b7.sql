
-- Create user roles enum and update profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Create static pages table
CREATE TABLE IF NOT EXISTS public.static_pages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text,
  meta_title text,
  meta_description text,
  meta_keywords text,
  canonical_url text,
  is_visible boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create contact submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  read boolean DEFAULT false
);

-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

-- Create blog_tags junction table
CREATE TABLE IF NOT EXISTS public.blog_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_post_id uuid REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES public.tags(id) ON DELETE CASCADE,
  UNIQUE(blog_post_id, tag_id)
);

-- Add SEO fields to existing tables
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS meta_keywords text;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS canonical_url text;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS slug text;

ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS meta_keywords text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS canonical_url text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS banner_url text;
ALTER TABLE public.shops ADD COLUMN IF NOT EXISTS long_description text;

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS meta_keywords text;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS canonical_url text;

ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS meta_keywords text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS canonical_url text;

-- Create system settings table for admin configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description) VALUES
  ('contact_email', 'admin@dealspark.com', 'Email address to receive contact form submissions'),
  ('google_client_id', '', 'Google OAuth Client ID'),
  ('facebook_app_id', '', 'Facebook App ID'),
  ('twitter_api_key', '', 'Twitter API Key')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.static_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view visible static pages" ON public.static_pages
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Root admins can manage static pages" ON public.static_pages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'root_admin'
    )
  );

CREATE POLICY "Anyone can insert contact submissions" ON public.contact_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Root admins can view contact submissions" ON public.contact_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'root_admin'
    )
  );

CREATE POLICY "Anyone can view tags" ON public.tags
  FOR SELECT USING (true);

CREATE POLICY "Root admins can manage tags" ON public.tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'root_admin'
    )
  );

CREATE POLICY "Anyone can view blog tags" ON public.blog_tags
  FOR SELECT USING (true);

CREATE POLICY "Root admins can manage blog tags" ON public.blog_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'root_admin'
    )
  );

CREATE POLICY "Root admins can manage system settings" ON public.system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'root_admin'
    )
  );

-- Create function to generate unique slugs
CREATE OR REPLACE FUNCTION public.generate_unique_slug(title text, table_name text)
RETURNS text AS $$
DECLARE
    base_slug text;
    final_slug text;
    counter integer := 0;
    slug_exists boolean;
BEGIN
    -- Generate base slug from title
    base_slug := lower(regexp_replace(trim(title), '[^a-zA-Z0-9\s]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    
    -- Start with base slug
    final_slug := base_slug;
    
    -- Check if slug exists and increment counter if needed
    LOOP
        EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE slug = $1)', table_name)
        USING final_slug
        INTO slug_exists;
        
        IF NOT slug_exists THEN
            EXIT;
        END IF;
        
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data
INSERT INTO public.static_pages (title, slug, content, meta_title, meta_description) VALUES
  ('About Us', 'about', '<h1>About DealSpark</h1><p>Your ultimate destination for the best deals and savings.</p>', 'About DealSpark - Best Deals Platform', 'Learn about DealSpark, your trusted source for the best deals, discounts, and savings opportunities online.'),
  ('Privacy Policy', 'privacy', '<h1>Privacy Policy</h1><p>We value your privacy and are committed to protecting your personal information.</p>', 'Privacy Policy - DealSpark', 'Read our privacy policy to understand how we collect, use, and protect your personal information.'),
  ('Terms & Conditions', 'terms', '<h1>Terms & Conditions</h1><p>Please read these terms carefully before using our service.</p>', 'Terms & Conditions - DealSpark', 'Read our terms and conditions to understand the rules and regulations for using DealSpark.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.tags (name, slug) VALUES
  ('Hot Deals', 'hot-deals'),
  ('Electronics', 'electronics'),
  ('Fashion', 'fashion'),
  ('Home & Garden', 'home-garden'),
  ('Travel', 'travel'),
  ('Food & Drink', 'food-drink')
ON CONFLICT (slug) DO NOTHING;
