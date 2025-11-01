import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { Heart, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Comment {
  id: string;
  body: string;
  users: {
    first_name: string;
    last_name: string;
  };
}

interface Post {
  id: string;
  user_id: string;
  photo_url: string;
  caption: string;
  created_at: string;
  users: {
    first_name: string;
    last_name: string;
    role: string;
    city: string;
    profile_photo_url: string;
  };
  likeCount?: number;
  isLiked?: boolean;
  comments?: Comment[];
}

export default function Feed() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

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
            first_name,
            last_name,
            role,
            city,
            profile_photo_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Load likes and comments for each post
      const postsWithData = await Promise.all((data || []).map(async (post) => {
        // Get like count
        const { count: likeCount } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        // Check if current user liked this post
        let isLiked = false;
        if (profile?.id) {
          const { data: userLike } = await supabase
            .from('likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', profile.id)
            .maybeSingle();
          isLiked = !!userLike;
        }

        // Get recent comments
        const { data: commentsData } = await supabase
          .from('comments')
          .select('id, body, users(first_name, last_name)')
          .eq('post_id', post.id)
          .order('created_at', { ascending: false })
          .limit(2);

        return {
          ...post,
          likeCount: likeCount || 0,
          isLiked,
          comments: commentsData || [],
        };
      }));

      setPosts(postsWithData);
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
        await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: profile.id });
      }

      // Update local state
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            isLiked: !currentlyLiked,
            likeCount: currentlyLiked ? (post.likeCount || 1) - 1 : (post.likeCount || 0) + 1,
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
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

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Feed" />

      <div className="max-w-md mx-auto">
        {posts.length === 0 ? (
          <div className="flex items-center justify-center p-6">
            <p className="text-muted-foreground">No posts yet. Follow some agents to see their content!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="mb-6 border-b border-border pb-4">
              <div className="flex items-center gap-3 p-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.users.profile_photo_url} alt={`${post.users.first_name} ${post.users.last_name}`} />
                  <AvatarFallback>{post.users.first_name[0]}{post.users.last_name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{post.users.first_name} {post.users.last_name}</p>
                  <p className="text-xs text-muted-foreground">{post.users.city}</p>
                </div>
              </div>

              <img
                src={post.photo_url}
                alt="Post"
                className="w-full aspect-square object-cover cursor-pointer"
                onClick={() => navigate(`/post/${post.id}`)}
              />

              <div className="p-4 space-y-2">
                <div className="flex gap-4">
                  <button 
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLikeToggle(post.id, post.isLiked || false);
                    }}
                  >
                    <Heart className={`h-6 w-6 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className="text-sm font-semibold">{post.likeCount || 0}</span>
                  </button>
                  <button 
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    <MessageCircle className="h-6 w-6" />
                  </button>
                </div>

                {post.caption && (
                  <p className="text-sm">
                    <span className="font-semibold">{post.users.first_name} {post.users.last_name}</span> {post.caption}
                  </p>
                )}

                {post.comments && post.comments.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {post.comments.slice(0, 2).map((comment) => (
                      <p key={comment.id} className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{comment.users.first_name}</span> {comment.body}
                      </p>
                    ))}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
