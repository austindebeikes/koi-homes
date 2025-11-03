-- Add unique constraint to prevent duplicate saves
ALTER TABLE public.saved_posts 
ADD CONSTRAINT saved_posts_user_post_unique UNIQUE (user_id, post_id);