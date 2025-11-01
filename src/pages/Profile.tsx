import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function Profile() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (profile?.id) {
      loadPosts();
      loadFollowCounts();
    }
  }, [profile?.id]);

  const loadPosts = async () => {
    if (!profile?.id) return;
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', profile.id)
      .eq('is_daily', false) // Exclude Daily's from profile gallery
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading posts:', error);
      return;
    }
    
    setPosts(data || []);
  };

  const loadFollowCounts = async () => {
    if (!profile?.id) return;

    // Get follower count
    const { count: followersCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', profile.id);

    // Get following count
    const { count: followingCountData } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', profile.id);

    setFollowerCount(followersCount || 0);
    setFollowingCount(followingCountData || 0);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader title="Profile" showLogo={false} />
        <div className="flex items-center justify-center p-6">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Profile" showLogo={false} />

      <div className="max-w-md mx-auto">
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage 
                src={profile.profile_photo_url} 
                alt="Profile"
              />
              <AvatarFallback>
                {profile.first_name?.[0]}{profile.last_name?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold">
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-muted-foreground text-sm">
                {profile.role === 'Agent' ? 'Real Estate Agent' : 'Home Buyer'}
              </p>
              <p className="text-sm text-muted-foreground">
                {profile.city}
              </p>
            </div>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/profile/edit')}
            >
              Edit
            </Button>
          </div>

          <Button 
            className="w-full" 
            size="lg"
            onClick={() => navigate('/post/new')}
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Post
          </Button>

          <p className="text-sm">
            {profile.bio}
          </p>

          <div className="flex gap-6 text-center">
            <div>
              <p className="font-bold text-lg">{posts.length}</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>
            <div>
              <p className="font-bold text-lg">{followerCount}</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div>
              <p className="font-bold text-lg">{followingCount}</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </div>

          <Button onClick={handleSignOut} variant="outline" className="w-full">
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
            <TabsTrigger value="services" className="flex-1">Services</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="p-1">
            <div className="grid grid-cols-2 gap-1">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post.id} className="relative group">
                    <img
                      src={post.photo_url}
                      alt={post.caption || 'Post'}
                      className="w-full aspect-square object-cover rounded cursor-pointer"
                      onClick={() => navigate(`/post/${post.id}`)}
                    />
                    {post.caption && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 rounded">
                        <p className="text-white text-xs line-clamp-2">{post.caption}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="col-span-2 text-center text-muted-foreground py-8">
                  No posts yet. Create your first post!
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="services" className="p-4">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-1.5">
                <span>🏡</span> First-time buyers
              </span>
              <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-1.5">
                <span>🎖️</span> VA loans
              </span>
              <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-1.5">
                <span>✈️</span> Relocation
              </span>
              <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-1.5">
                <span>🔑</span> Off-market deals
              </span>
              <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-1.5">
                <span>🌴</span> Coastal expert
              </span>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}
