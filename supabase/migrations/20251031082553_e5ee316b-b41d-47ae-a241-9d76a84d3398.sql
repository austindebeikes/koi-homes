-- Fix search_path for security
CREATE OR REPLACE FUNCTION public.update_posts_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.users
    SET posts_count = posts_count + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.users
    SET posts_count = posts_count - 1
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
END;
$$;