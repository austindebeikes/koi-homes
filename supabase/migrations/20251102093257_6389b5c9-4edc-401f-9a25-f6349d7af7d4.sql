-- Add is_daily column to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS is_daily BOOLEAN NOT NULL DEFAULT false;

-- Add services column to users table (stored as jsonb array)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]'::jsonb;

-- Create saved_posts table (pond feature)
CREATE TABLE IF NOT EXISTS public.saved_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS on saved_posts
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_posts
CREATE POLICY "Users can view their own saved posts"
ON public.saved_posts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts"
ON public.saved_posts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave posts"
ON public.saved_posts
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_posts_is_daily ON public.posts(is_daily, created_at) WHERE is_daily = true;
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON public.saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_post_id ON public.saved_posts(post_id);