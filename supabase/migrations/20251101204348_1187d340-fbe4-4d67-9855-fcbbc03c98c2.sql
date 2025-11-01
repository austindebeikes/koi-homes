-- Create intros table for tracking buyer interest in agents
CREATE TABLE IF NOT EXISTS public.intros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('coffee', 'video')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.intros ENABLE ROW LEVEL SECURITY;

-- Policies for intros table
CREATE POLICY "Users can insert their own intros"
  ON public.intros
  FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can view intros they're involved in"
  ON public.intros
  FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = agent_id);