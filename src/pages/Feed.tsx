import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DailyCard } from '@/components/DailyCard';
import { Button } from '@/components/ui/button';
import { Camera, Heart, MessageCircle, Bookmark } from 'lucide-react';
import { toast } from 'sonner';

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
  likesCount?: number;
  userLiked?: boolean;
  userSaved?: boolean;
}

export default function Feed() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
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
      
      // Get like counts and check if user liked/saved each post
      const postsWithLikes = await Promise.all((data || []).map(async (post) => {
        // Get total likes count
        const { count: likesCount } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        // Check if current user liked this post
        let userLiked = false;
        let userSaved = false;
        if (profile?.id) {
          const { data: likeData } = await supabase
            .from('likes')
            .select('id')
            .eq('user_id', profile.id)
            .eq('post_id', post.id)
            .maybeSingle();
          userLiked = !!likeData;

          const { data: saveData } = await supabase
            .from('saved_posts')
            .select('id')
            .eq('user_id', profile.id)
            .eq('post_id', post.id)
            .maybeSingle();
          userSaved = !!saveData;
        }

        return {
          ...post,
          likesCount: likesCount || 0,
          userLiked,
          userSaved,
        };
      }));

      setPosts(postsWithLikes);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async (postId: string, currentlyLiked: boolean) => {
    if (!profile?.id) return;

    try {
      if (currentlyLiked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', profile.id);
      } else {
        // Like
        const { error: insertError } = await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: profile.id });
        
        if (insertError) throw insertError;
        
        // Create notification for the post author
        const post = posts.find(p => p.id === postId);
        if (post && post.user_id !== profile.id) {
          await supabase
            .from('notifications')
            .insert({
              user_id: post.user_id,
              type: 'like',
              message: `${profile.first_name} ${profile.last_name} liked your post`,
              related_user_id: profile.id,
              related_post_id: postId,
            });
        }
      }

      // Update local state
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            userLiked: !currentlyLiked,
            likesCount: currentlyLiked ? (post.likesCount || 0) - 1 : (post.likesCount || 0) + 1,
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
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
        
        toast.success('Removed from saved snapshots');
      } else {
        // Save
        const { error: insertError } = await supabase
          .from('saved_posts')
          .insert({ post_id: postId, user_id: profile.id });
        
        if (insertError) throw insertError;
        
        toast.success('Added to saved snapshots');
        
        // Create notification for the post author
        const post = posts.find(p => p.id === postId);
        if (post && post.user_id !== profile.id) {
          await supabase
            .from('notifications')
            .insert({
              user_id: post.user_id,
              type: 'save',
              message: `${profile.first_name} ${profile.last_name} saved your post`,
              related_user_id: profile.id,
              related_post_id: postId,
            });
        }
      }

      // Update local state
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            userSaved: !currentlySaved,
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
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'snapshots'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <Camera className="h-4 w-4" />
            Snapshots
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
              <div 
                key={post.id} 
                className="mb-6 bg-card rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] overflow-hidden border border-border/50 cursor-pointer"
                onClick={() => navigate(`/post/${post.id}`)}
              >
                <div 
                  className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (post.users.id === profile?.id) {
                      navigate('/profile');
                    } else {
                      navigate(`/agent/${post.users.id}`);
                    }
                  }}
                >
                  <Avatar className="h-10 w-10 border-2 border-primary/10">
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
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={post.userLiked ? "default" : "outline"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLikeToggle(post.id, post.userLiked || false);
                        }}
                        className="gap-1.5"
                      >
                        <Heart className={`h-4 w-4 ${post.userLiked ? 'fill-current' : ''}`} />
                        <span>{post.likesCount || 0}</span>
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="accent"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/chat/${post.users.id}`);
                        }}
                        className="gap-1.5"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Message Agent</span>
                      </Button>

                      <Button
                        size="sm"
                        variant={post.userSaved ? "default" : "outline"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveToggle(post.id, post.userSaved || false);
                        }}
                        className="gap-1.5"
                      >
                        <Bookmark className={`h-4 w-4 ${post.userSaved ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
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
