-- Add is_daily column to posts table to distinguish Daily's from regular posts
ALTER TABLE public.posts 
ADD COLUMN is_daily BOOLEAN DEFAULT false NOT NULL;

-- Add index for efficient querying of Daily's
CREATE INDEX idx_posts_is_daily_created_at ON public.posts(is_daily, created_at) WHERE is_daily = true;

-- Add comment for documentation
COMMENT ON COLUMN public.posts.is_daily IS 'Indicates if this is a Daily (24-hour temporary post) vs permanent photo post';