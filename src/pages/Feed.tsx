import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle } from 'lucide-react';
import { PostDetail } from '@/components/PostDetail';

interface Post {
  id: string;
  photo_url: string;
  caption: string;
  created_at: string;
  user_id: string;
  users: {
    first_name: string;
    last_name: string;
    profile_photo_url: string;
  };
  likes?: { count: number }[];
  userLiked?: boolean;
  commentCount?: number;
}

export default function Feed() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadPosts();
  }, [user, profile?.id]);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          users(first_name, last_name, profile_photo_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Load likes and comments for each post
      const postsWithInteractions = await Promise.all(
        (data || []).map(async (post) => {
          // Get like count
          const { count: likeCount } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          // Check if current user liked
          const { data: userLike } = await supabase
            .from('likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', profile?.id || '')
            .maybeSingle();

          // Get comment count
          const { count: commentCount } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          return {
            ...post,
            likes: [{ count: likeCount || 0 }],
            userLiked: !!userLike,
            commentCount: commentCount || 0,
          };
        })
      );

      setPosts(postsWithInteractions);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string, currentlyLiked: boolean) => {
    if (!profile?.id) return;

    try {
      if (currentlyLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', profile.id);
      } else {
        await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: profile.id });
      }

      // Refresh posts
      loadPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader title="Feed" showLogo={true} />
        <div className="flex items-center justify-center p-6">
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Feed" showLogo={true} />

      <div className="max-w-md mx-auto">
        {posts.length === 0 ? (
          <div className="flex items-center justify-center p-6">
            <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-card border-b">
                <div className="p-3 flex items-center gap-3">
                  <Avatar 
                    className="cursor-pointer"
                    onClick={() => navigate(`/agent/${post.user_id}`)}
                  >
                    <AvatarImage src={post.users.profile_photo_url} />
                    <AvatarFallback>
                      {post.users.first_name[0]}{post.users.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p 
                      className="font-semibold text-sm cursor-pointer hover:underline"
                      onClick={() => navigate(`/agent/${post.user_id}`)}
                    >
                      {post.users.first_name} {post.users.last_name}
                    </p>
                  </div>
                </div>

                <img
                  src={post.photo_url}
                  alt={post.caption || 'Post'}
                  className="w-full aspect-square object-cover cursor-pointer"
                  onClick={() => setSelectedPostId(post.id)}
                />

                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id, post.userLiked || false)}
                      className="p-0 h-auto hover:bg-transparent"
                    >
                      <Heart
                        className={`h-6 w-6 ${
                          post.userLiked ? 'fill-primary text-primary' : ''
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPostId(post.id)}
                      className="p-0 h-auto hover:bg-transparent"
                    >
                      <MessageCircle className="h-6 w-6" />
                    </Button>
                  </div>

                  <p className="text-sm font-semibold">
                    {post.likes?.[0]?.count || 0} likes
                  </p>

                  {post.caption && (
                    <p className="text-sm">
                      <span className="font-semibold mr-2">
                        {post.users.first_name} {post.users.last_name}
                      </span>
                      {post.caption}
                    </p>
                  )}

                  {(post.commentCount || 0) > 0 && (
                    <button
                      onClick={() => setSelectedPostId(post.id)}
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      View all {post.commentCount} comments
                    </button>
                  )}

                  <p className="text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />

      {selectedPostId && (
        <PostDetail
          postId={selectedPostId}
          open={!!selectedPostId}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedPostId(null);
              loadPosts(); // Refresh to show new comments/likes
            }
          }}
        />
      )}
    </div>
  );
}
