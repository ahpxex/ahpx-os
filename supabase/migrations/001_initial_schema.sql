-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT DEFAULT '/icons/1F464.svg',
  date TEXT,
  content JSONB DEFAULT '{"gadgets": [], "layout": {"columns": 12, "rowHeight": 30}}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  avatar_url TEXT
);

-- Create system_info table
CREATE TABLE IF NOT EXISTS public.system_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version TEXT NOT NULL,
  name TEXT DEFAULT 'ahpx-os',
  description TEXT,
  wallpaper TEXT,
  theme JSONB DEFAULT '{}'::jsonb,
  config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create blog_posts table (if not exists)
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  date TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  content JSONB,
  slug TEXT UNIQUE NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Anyone can read active profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (is_active = TRUE);

-- Only authenticated users can insert their own profiles
CREATE POLICY "Users can insert their own profiles" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only profile owner can update
CREATE POLICY "Users can update their own profiles" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Only profile owner can delete (soft delete via is_active)
CREATE POLICY "Users can delete their own profiles" ON public.profiles
  FOR DELETE USING (auth.uid() = user_id);

-- System info policies
-- Anyone can read active system info
CREATE POLICY "System info is viewable by everyone" ON public.system_info
  FOR SELECT USING (is_active = TRUE);

-- Blog posts policies
-- Anyone can read published posts
CREATE POLICY "Published posts are viewable by everyone" ON public.blog_posts
  FOR SELECT USING (published = TRUE);

-- Authenticated users can read all posts (including drafts)
CREATE POLICY "Authenticated users can view all posts" ON public.blog_posts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only authenticated users can insert
CREATE POLICY "Authenticated users can insert posts" ON public.blog_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update
CREATE POLICY "Authenticated users can update posts" ON public.blog_posts
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users can delete
CREATE POLICY "Authenticated users can delete posts" ON public.blog_posts
  FOR DELETE USING (auth.role() = 'authenticated');

-- Insert default system info
INSERT INTO public.system_info (version, name, description)
VALUES ('1.0.0', 'ahpx-os', 'A web-based OS interface')
ON CONFLICT DO NOTHING;
