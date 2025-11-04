import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Plus, Camera, Bookmark } from 'lucide-react';
import { ServiceManager } from '@/components/ServiceManager';
import { DailyCard } from '@/components/DailyCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [dailyPost, setDailyPost] = useState<any>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [services, setServices] = useState<string[]>([]);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (profile?.id) {
      loadPosts();
      loadSavedPosts();
      loadFollowCounts();
      loadDaily();
      setServices((profile as any).services || []);
    }
  }, [profile?.id]);

  const loadPosts = async () => {
    if (!profile?.id) return;
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', profile.id)
      .eq('is_daily', false)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading posts:', error);
      return;
    }
    
    setPosts(data || []);
  };

  const loadSavedPosts = async () => {
    if (!profile?.id) return;
    
    const { data, error } = await supabase
      .from('saved_posts')
      .select(`
        post_id,
        posts (
          id,
          photo_url,
          caption,
          created_at,
          user_id,
          users (
            first_name,
            last_name,
            profile_photo_url
          )
        )
      `)
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading saved posts:', error);
      return;
    }
    
    setSavedPosts(data?.map(item => item.posts).filter(Boolean) || []);
  };

  const loadDaily = async () => {
    if (!profile?.id) return;
    
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        users:user_id (
          id,
          first_name,
          last_name,
          city,
          profile_photo_url
        )
      `)
      .eq('user_id', profile.id)
      .eq('is_daily', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('Error loading daily:', error);
      return;
    }
    
    // Only show if less than 24 hours old
    if (data) {
      const postAge = Date.now() - new Date(data.created_at).getTime();
      const hoursSincePost = postAge / (1000 * 60 * 60);
      if (hoursSincePost < 24) {
        setDailyPost(data);
      }
    }
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

  const handleDeletePost = async () => {
    if (!deletePostId) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', deletePostId);

      if (error) throw error;

      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      });

      await loadPosts();
      await refreshProfile();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive",
      });
    } finally {
      setDeletePostId(null);
    }
  };

  const handleMouseDown = (postId: string) => {
    const timer = setTimeout(() => {
      setDeletePostId(postId);
    }, 500); // 500ms long press
    setPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
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
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-24 w-24 border-4 border-primary/10">
              <AvatarImage 
                src={profile.profile_photo_url} 
                alt="Profile"
              />
              <AvatarFallback>
                {profile.first_name?.[0]}{profile.last_name?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold mb-0.5 leading-tight">
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-muted-foreground text-xs mb-0.5">
                {profile.role === 'Agent' ? 'Real Estate Agent' : 'Home Buyer'}
              </p>
              <p className="text-xs text-muted-foreground">
                {profile.city}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/profile/edit')}
              >
                Edit
              </Button>
            </div>
          </div>

          {/* Show Daily if exists and is recent */}
          {dailyPost && (
            <div className="pt-0.5">
              <h3 className="text-xs font-semibold mb-1.5 text-muted-foreground">Today&apos;s Quote</h3>
              <DailyCard daily={dailyPost} />
            </div>
          )}

          {profile?.role === 'Agent' && (
            <Button 
              variant="accent"
              className="w-full" 
              size="lg"
              onClick={() => navigate('/post/new')}
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Post
            </Button>
          )}

          <p className="text-sm leading-relaxed">
            {profile.bio}
          </p>

          <div className="flex gap-8 text-center py-2">
            <div>
              <p className="font-bold text-lg leading-tight">{posts.length}</p>
              <p className="text-xs text-muted-foreground">Snapshots</p>
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">{followerCount}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">{followingCount}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
          </div>

          <div className="space-y-2">
            <Button onClick={handleSignOut} variant="outline" className="w-full">
              Sign Out
            </Button>
          </div>
        </div>

        {/* Buyers: Simple saved posts section without tabs */}
        {profile.role === 'Buyer' && (
          <div className="p-4">
            <h3 className="text-center font-semibold mb-3 flex items-center justify-center gap-2">
              <Camera className="h-4 w-4" />
              Saved snapshots
            </h3>
            <div className="grid grid-cols-2 gap-1">
              {savedPosts.length > 0 ? (
                savedPosts.map((post: any) => (
                  <img
                    key={post.id}
                    src={post.photo_url}
                    alt={post.caption || 'Saved post'}
                    className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => navigate(`/post/${post.id}`)}
                  />
                ))
              ) : (
                <p className="col-span-2 text-center text-muted-foreground py-8">
                  No saved snapshots yet. Save posts from your feed!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Agents: Tabs for snapshots and services */}
        {profile.role === 'Agent' && (
          <Tabs defaultValue="snapshots" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="snapshots" className="flex-1 gap-1">
                <Camera className="h-4 w-4" />
                Snapshots
              </TabsTrigger>
              <TabsTrigger value="services" className="flex-1">Services</TabsTrigger>
            </TabsList>

            <TabsContent value="snapshots" className="p-1">
              <div className="grid grid-cols-2 gap-1">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <div 
                      key={post.id} 
                      className="relative group cursor-pointer"
                      onClick={() => navigate(`/post/${post.id}`)}
                      onMouseDown={() => handleMouseDown(post.id)}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onTouchStart={() => handleMouseDown(post.id)}
                      onTouchEnd={handleMouseUp}
                    >
                      <img
                        src={post.photo_url}
                        alt={post.caption || 'Post'}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      {post.caption && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 rounded-lg">
                          <p className="text-white text-xs line-clamp-2">{post.caption}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="col-span-2 text-center text-muted-foreground py-8">
                    No snapshots yet. Create your first snapshot!
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="services" className="p-4">
              <ServiceManager 
                services={services} 
                onServicesChange={setServices} 
              />
            </TabsContent>
          </Tabs>
        )}

        <AlertDialog open={!!deletePostId} onOpenChange={(open) => !open && setDeletePostId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Snapshot?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this snapshot? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletePost}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <BottomNav />
    </div>
  );
}
