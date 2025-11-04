-- Create meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('coffee', 'video')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view meetings they're involved in"
ON public.meetings FOR SELECT
TO authenticated
USING (auth.uid() = agent_id OR auth.uid() = buyer_id);

CREATE POLICY "Buyers can create meetings"
ON public.meetings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = buyer_id);

-- Add is_read column to messages if it doesn't exist
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;

-- Create post_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS on post_likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Policies for post_likes
CREATE POLICY "Anyone can view likes"
ON public.post_likes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can like posts"
ON public.post_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
ON public.post_likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);