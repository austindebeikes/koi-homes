import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DailyCard } from '@/components/DailyCard';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import koiLogo from '@/assets/koi-logo.png';

interface Post {
  id: string;
  user_id: string;
  photo_url: string;
  caption: string;
  created_at: string;
  is_daily: boolean;
  users: {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
    city: string;
    profile_photo_url: string;
  };
  isSaved?: boolean;
}

export default function Feed() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'snapshots' | 'dailys'>('snapshots');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadPosts();
  }, [user, navigate]);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          users:user_id (
            id,
            first_name,
            last_name,
            role,
            city,
            profile_photo_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Check saved status for each post
      const postsWithSaved = await Promise.all((data || []).map(async (post) => {
        let isSaved = false;
        if (profile?.id) {
          const { data: savedPost } = await supabase
            .from('saved_posts')
            .select('id')
            .eq('user_id', profile.id)
            .eq('post_id', post.id)
            .maybeSingle();
          isSaved = !!savedPost;
        }

        return {
          ...post,
          isSaved,
        };
      }));

      setPosts(postsWithSaved);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToggle = async (postId: string, currentlySaved: boolean) => {
    if (!profile?.id) return;

    try {
      if (currentlySaved) {
        // Unsave
        await supabase
          .from('saved_posts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', profile.id);
      } else {
        // Save
        await supabase
          .from('saved_posts')
          .insert({ post_id: postId, user_id: profile.id });
        
        toast({
          title: "Added to your pond! 🐟",
          description: "This snapshot has been saved to your collection.",
        });
      }

      // Update local state
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            isSaved: !currentlySaved,
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader title="Feed" />
        <div className="flex items-center justify-center p-6">
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'snapshots') {
      // Snapshots: regular photos that are NOT Daily's
      return post.photo_url && post.photo_url.trim() !== '' && !post.is_daily;
    } else {
      // Daily's: only show Daily's that are less than 24 hours old
      if (!post.is_daily) return false;
      const postAge = Date.now() - new Date(post.created_at).getTime();
      const hoursSincePost = postAge / (1000 * 60 * 60);
      return hoursSincePost < 24;
    }
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Feed" />

      <div className="max-w-md mx-auto">
        <div className="flex gap-2 p-4 border-b border-border">
          <button
            onClick={() => setActiveTab('snapshots')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'snapshots'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            📸 Snapshots
          </button>
          <button
            onClick={() => setActiveTab('dailys')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'dailys'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Daily&apos;s
          </button>
        </div>
        {filteredPosts.length === 0 ? (
          <div className="flex items-center justify-center p-6">
            <p className="text-muted-foreground">
              {activeTab === 'snapshots' 
                ? 'No snapshots yet. Follow some agents to see their content!'
                : 'No daily updates yet. Follow some agents to see their content!'}
            </p>
          </div>
        ) : (
          activeTab === 'dailys' ? (
            // Daily's view
            <div className="p-4">
              {filteredPosts.map((post) => (
                <DailyCard key={post.id} daily={post} />
              ))}
            </div>
          ) : (
            // Snapshots view
            filteredPosts.map((post) => (
              <div key={post.id} className="mb-6 border-b border-border pb-4">
                <div 
                  className="flex items-center gap-3 p-4 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    if (post.users.id === profile?.id) {
                      navigate('/profile');
                    } else {
                      navigate(`/agent/${post.users.id}`);
                    }
                  }}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.users.profile_photo_url} alt={`${post.users.first_name} ${post.users.last_name}`} />
                    <AvatarFallback>{post.users.first_name[0]}{post.users.last_name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{post.users.first_name} {post.users.last_name}</p>
                    <p className="text-xs text-muted-foreground">{post.users.city}</p>
                  </div>
                </div>

                {post.photo_url && post.photo_url.trim() !== '' && (
                  <img
                    src={post.photo_url}
                    alt="Post"
                    className="w-full aspect-square object-cover"
                  />
                )}

                <div className="p-4 space-y-3">
                  {post.caption && (
                    <p className="text-sm text-foreground">
                      {post.caption}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                    
                    <Button
                      size="sm"
                      variant={post.isSaved ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveToggle(post.id, post.isSaved || false);
                      }}
                      className="gap-2"
                    >
                      <img src={koiLogo} alt="Koi" className="h-4 w-4" />
                      {post.isSaved ? 'In Pond' : 'Add to Pond'}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>

      <BottomNav />
    </div>
  );
}
