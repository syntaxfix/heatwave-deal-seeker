
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shops table
CREATE TABLE public.shops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deals table
CREATE TABLE public.deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  original_price DECIMAL(10,2),
  discounted_price DECIMAL(10,2),
  discount_percentage INTEGER,
  affiliate_link TEXT,
  category_id UUID REFERENCES public.categories(id),
  shop_id UUID REFERENCES public.shops(id),
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  heat_score INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deal votes table
CREATE TABLE public.deal_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(deal_id, user_id)
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coupons table
CREATE TABLE public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  discount_percentage INTEGER,
  discount_amount DECIMAL(10,2),
  expires_at TIMESTAMP WITH TIME ZONE,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog posts table
CREATE TABLE public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  content TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES auth.users(id),
  category TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  read_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for categories (public read, admin write)
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create RLS policies for shops (public read, admin write)
CREATE POLICY "Anyone can view shops" ON public.shops FOR SELECT USING (true);
CREATE POLICY "Admins can manage shops" ON public.shops FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create RLS policies for deals
CREATE POLICY "Anyone can view approved deals" ON public.deals FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can view own deals" ON public.deals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create deals" ON public.deals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own deals" ON public.deals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all deals" ON public.deals FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- Create RLS policies for deal votes
CREATE POLICY "Users can view all votes" ON public.deal_votes FOR SELECT USING (true);
CREATE POLICY "Users can manage own votes" ON public.deal_votes FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for comments
CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for coupons (public read, admin write)
CREATE POLICY "Anyone can view coupons" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create RLS policies for blog posts
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Authors can manage own posts" ON public.blog_posts FOR ALL USING (auth.uid() = author_id);
CREATE POLICY "Admins can manage all blog posts" ON public.blog_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update deal heat score
CREATE OR REPLACE FUNCTION public.update_deal_heat_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.deals 
  SET 
    heat_score = (
      SELECT COALESCE(
        (COUNT(CASE WHEN vote_type = 'up' THEN 1 END) * 2) - 
        COUNT(CASE WHEN vote_type = 'down' THEN 1 END), 
        0
      )
      FROM public.deal_votes 
      WHERE deal_id = COALESCE(NEW.deal_id, OLD.deal_id)
    ),
    upvotes = (
      SELECT COUNT(*) FROM public.deal_votes 
      WHERE deal_id = COALESCE(NEW.deal_id, OLD.deal_id) AND vote_type = 'up'
    ),
    downvotes = (
      SELECT COUNT(*) FROM public.deal_votes 
      WHERE deal_id = COALESCE(NEW.deal_id, OLD.deal_id) AND vote_type = 'down'
    )
  WHERE id = COALESCE(NEW.deal_id, OLD.deal_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating heat scores
CREATE TRIGGER update_heat_score_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.deal_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_deal_heat_score();

-- Insert sample categories
INSERT INTO public.categories (name, slug, description, icon) VALUES
('Electronics', 'electronics', 'Latest gadgets, smartphones, laptops, and tech accessories', 'Smartphone'),
('Gaming', 'gaming', 'Video games, consoles, accessories, and gaming gear', 'Gamepad2'),
('Fashion', 'fashion', 'Clothing, shoes, accessories, and style essentials', 'Shirt'),
('Automotive', 'automotive', 'Car accessories, tools, parts, and automotive essentials', 'Car'),
('Home & Garden', 'home-garden', 'Home decor, furniture, garden tools, and essentials', 'Home'),
('Books', 'books', 'Books, e-books, audiobooks, and educational materials', 'Book'),
('Food & Drinks', 'food-drinks', 'Groceries, beverages, snacks, and gourmet food', 'Utensils'),
('Health & Beauty', 'health-beauty', 'Cosmetics, skincare, wellness, and health supplements', 'Shield');

-- Insert sample shops
INSERT INTO public.shops (name, slug, description, logo_url, website_url, category) VALUES
('Amazon', 'amazon', 'Everything you need, delivered fast', 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=100&h=100&fit=crop', 'https://amazon.com', 'General'),
('Best Buy', 'best-buy', 'Electronics and tech gadgets', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop', 'https://bestbuy.com', 'Electronics'),
('Nike', 'nike', 'Athletic wear and sports equipment', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop', 'https://nike.com', 'Fashion'),
('Target', 'target', 'Home, fashion, and everyday essentials', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop', 'https://target.com', 'General'),
('GameStop', 'gamestop', 'Video games and gaming accessories', 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=100&h=100&fit=crop', 'https://gamestop.com', 'Gaming');

-- Insert sample blog posts
INSERT INTO public.blog_posts (title, slug, summary, content, featured_image, category, tags, read_time) VALUES
('Best Money-Saving Apps 2024', 'best-money-saving-apps-2024', 'Discover the top apps that help you save money on everyday purchases', '<p>In 2024, saving money has never been easier thanks to innovative mobile apps. Here are the best money-saving apps you should have on your phone...</p>', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop', 'Finance', ARRAY['apps', 'money', 'savings'], 5),
('Holiday Shopping Guide', 'holiday-shopping-guide-2024', 'Smart strategies for saving money during the holiday season', '<p>The holiday season is approaching, and with it comes the opportunity to save big on gifts and essentials. Here''s your complete guide...</p>', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop', 'Shopping', ARRAY['holidays', 'shopping', 'deals'], 8),
('Tech Deals: What to Buy Now', 'tech-deals-what-to-buy-now', 'The best technology deals available right now', '<p>Technology moves fast, and so do the deals. Here are the best tech deals you should consider buying today...</p>', 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&h=400&fit=crop', 'Technology', ARRAY['tech', 'electronics', 'deals'], 6),
('Grocery Shopping Hacks', 'grocery-shopping-money-saving-hacks', '15 proven ways to cut your grocery bill in half', '<p>Grocery shopping doesn''t have to break the bank. With these 15 proven strategies, you can significantly reduce your food expenses...</p>', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=400&fit=crop', 'Food', ARRAY['grocery', 'food', 'savings'], 7),
('Fashion Deals: Designer for Less', 'fashion-deals-designer-for-less', 'How to get designer fashion without the designer price tag', '<p>Looking good doesn''t have to cost a fortune. Here''s how to find amazing fashion deals on designer and premium brands...</p>', 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=400&fit=crop', 'Fashion', ARRAY['fashion', 'designer', 'deals'], 4);
