-- Add is_daily column to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS is_daily boolean NOT NULL DEFAULT false;

-- Create index for efficient Daily's queries
CREATE INDEX IF NOT EXISTS idx_posts_is_daily_created_at 
ON public.posts(is_daily, created_at) 
WHERE is_daily = true;