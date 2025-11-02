import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

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

interface InterestedBuyer {
  user_id: string;
  users: {
    id: string;
    first_name: string;
    last_name: string;
    profile_photo_url: string;
    city: string;
    role: string;
  };
  post_id: string;
  posts: {
    photo_url: string;
  };
}

export default function Pond() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [interestedBuyers, setInterestedBuyers] = useState<InterestedBuyer[]>([]);
  const [loading, setLoading] = useState(true);
  const isAgent = profile?.role === 'Agent';

  useEffect(() => {
    if (profile?.id) {
      if (isAgent) {
        loadInterestedBuyers();
      } else {
        loadSavedPosts();
      }
    }
  }, [profile?.id, isAgent]);

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

  const loadInterestedBuyers = async () => {
    if (!profile?.id) return;

    try {
      // Get all posts by this agent
      const { data: agentPosts, error: postsError } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', profile.id);

      if (postsError) throw postsError;
      
      const postIds = agentPosts?.map(p => p.id) || [];

      if (postIds.length === 0) {
        setLoading(false);
        return;
      }

      // Get buyers who saved these posts
      const { data, error } = await supabase
        .from('saved_posts')
        .select(`
          user_id,
          post_id,
          posts (
            photo_url
          ),
          users:user_id (
            id,
            first_name,
            last_name,
            profile_photo_url,
            city,
            role
          )
        `)
        .in('post_id', postIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter unique buyers
      const uniqueBuyers = data?.filter((item: any, index: number, self: any[]) =>
        index === self.findIndex((t: any) => t.user_id === item.user_id)
      ) || [];
      
      setInterestedBuyers(uniqueBuyers as any);
    } catch (error) {
      console.error('Error loading interested buyers:', error);
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
        {isAgent ? (
          <>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Buyers interested in your snapshots
            </p>

            {interestedBuyers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No interested buyers yet. Keep posting great snapshots!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {interestedBuyers.map((buyer) => (
                  <div 
                    key={buyer.user_id} 
                    className="flex items-center gap-3 p-4 bg-card rounded-lg border"
                  >
                    <Avatar 
                      className="h-12 w-12 cursor-pointer" 
                      onClick={() => navigate(`/agent/${buyer.users.id}`)}
                    >
                      <AvatarImage src={buyer.users.profile_photo_url} />
                      <AvatarFallback>
                        {buyer.users.first_name[0]}{buyer.users.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">
                        {buyer.users.first_name} {buyer.users.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {buyer.users.city}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => navigate(`/messages/${buyer.users.id}`)}
                      className="gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Message
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}