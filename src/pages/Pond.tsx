import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SavedPost {
  id: string;
  post_id: string;
  posts: {
    id: string;
    photo_url: string;
    caption: string;
    user_id: string;
    users: {
      id: string;
      first_name: string;
      last_name: string;
      profile_photo_url: string;
      city: string;
    };
  };
}

export default function Pond() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      loadSavedPosts();
    }
  }, [profile?.id]);

  const loadSavedPosts = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('saved_posts')
        .select(`
          id,
          post_id,
          posts (
            id,
            photo_url,
            caption,
            user_id,
            users (
              id,
              first_name,
              last_name,
              profile_photo_url,
              city
            )
          )
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedPosts(data || []);
    } catch (error) {
      console.error('Error loading saved posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader title="My Pond" showLogo={false} />
        <div className="flex items-center justify-center p-6">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="My Pond" showLogo={false} />

      <div className="max-w-md mx-auto p-4">
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Your collection of saved snapshots
        </p>

        {savedPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Your pond is empty. Start saving snapshots you love!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {savedPosts.map((saved) => (
              <div key={saved.id} className="relative">
                <img
                  src={saved.posts.photo_url}
                  alt={saved.posts.caption || 'Saved post'}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <div 
                  className="absolute top-2 left-2 cursor-pointer"
                  onClick={() => {
                    if (saved.posts.users.id === profile?.id) {
                      navigate('/profile');
                    } else {
                      navigate(`/agent/${saved.posts.users.id}`);
                    }
                  }}
                >
                  <Avatar className="h-8 w-8 ring-2 ring-background">
                    <AvatarImage src={saved.posts.users.profile_photo_url} />
                    <AvatarFallback className="text-xs">
                      {saved.posts.users.first_name[0]}{saved.posts.users.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}