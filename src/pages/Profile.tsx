import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const userPosts = user?.user_metadata?.posts || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Profile" showLogo={false} />

      <div className="max-w-md mx-auto">
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage 
                src={user?.user_metadata?.profile_photo || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop"} 
                alt="Profile"
              />
              <AvatarFallback>
                {user?.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold">
                {user?.user_metadata?.firstName || user?.user_metadata?.first_name} {user?.user_metadata?.lastName || user?.user_metadata?.last_name}
              </h2>
              <p className="text-muted-foreground text-sm">
                {user?.user_metadata?.role === 'Agent' ? 'Real Estate Agent' : 'Home Buyer'}
              </p>
              <p className="text-sm text-muted-foreground">
                {user?.user_metadata?.city || 'San Diego, CA'}
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
            {user?.user_metadata?.bio || 'Helping clients buy and sell homes. Passionate about real estate and connecting people with their dream properties.'}
          </p>

          <div className="flex gap-6 text-center">
            <div>
              <p className="font-bold text-lg">55</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>
            <div>
              <p className="font-bold text-lg">1.2K</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div>
              <p className="font-bold text-lg">340</p>
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
            <TabsTrigger value="lifestyle" className="flex-1">Lifestyle</TabsTrigger>
            <TabsTrigger value="highlights" className="flex-1">Highlights</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="p-1">
            <div className="grid grid-cols-2 gap-1">
              {userPosts.length > 0 ? (
                userPosts.map((post: any, idx: number) => (
                  <img
                    key={idx}
                    src={post.imageUrl}
                    alt={post.caption || `Post ${idx + 1}`}
                    className="w-full aspect-square object-cover rounded"
                  />
                ))
              ) : (
                <p className="col-span-2 text-center text-muted-foreground py-8">
                  No posts yet. Create your first post!
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="lifestyle" className="p-4">
            <p className="text-center text-muted-foreground">No lifestyle posts yet</p>
          </TabsContent>

          <TabsContent value="highlights" className="p-4">
            <p className="text-center text-muted-foreground">No highlights yet</p>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}
