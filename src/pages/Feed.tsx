import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { Heart, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
}

export default function Feed() {
  const { user } = useAuth();
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
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
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
                className="w-full aspect-square object-cover"
              />

              <div className="p-4 space-y-2">
                <div className="flex gap-4">
                  <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                    <Heart className="h-6 w-6" />
                  </button>
                  <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                    <MessageCircle className="h-6 w-6" />
                  </button>
                </div>

                <p className="text-sm">
                  <span className="font-semibold">{post.users.first_name} {post.users.last_name}</span> {post.caption}
                </p>
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
