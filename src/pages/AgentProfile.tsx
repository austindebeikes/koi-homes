import { useParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle } from 'lucide-react';
import { mockUsers } from '@/lib/mockData';

export default function AgentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const agent = id ? mockUsers[id] : null;

  if (!agent) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader title="Agent Profile" showLogo={false} />
        <div className="max-w-md mx-auto p-6">
          <p className="text-center text-muted-foreground">Agent not found</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title={`${agent.firstName} ${agent.lastName}`} showLogo={false} />

      <div className="max-w-md mx-auto">
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={agent.profilePhotoUrl} alt={`${agent.firstName} ${agent.lastName}`} />
              <AvatarFallback>
                {agent.firstName[0]}{agent.lastName[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold">
                {agent.firstName} {agent.lastName}
              </h2>
              <p className="text-muted-foreground text-sm">
                {agent.role === 'Agent' ? 'Real Estate Agent' : 'Home Buyer'}
              </p>
              <p className="text-sm text-muted-foreground">
                {agent.city}
              </p>
            </div>
          </div>

          <Button 
            className="w-full" 
            size="lg"
            onClick={() => navigate(`/chat/${agent.id}`)}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Message
          </Button>

          <p className="text-sm">
            {agent.bio}
          </p>

          <div className="flex gap-6 text-center">
            <div>
              <p className="font-bold text-lg">{agent.posts}</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>
            <div>
              <p className="font-bold text-lg">{agent.followers}</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div>
              <p className="font-bold text-lg">{agent.following}</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
            <TabsTrigger value="lifestyle" className="flex-1">Lifestyle</TabsTrigger>
            <TabsTrigger value="highlights" className="flex-1">Highlights</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="p-1">
            <div className="grid grid-cols-2 gap-1">
              {agent.recentPosts.map((post, idx) => (
                <img
                  key={idx}
                  src={post.imageUrl}
                  alt={post.caption}
                  className="w-full aspect-square object-cover rounded"
                />
              ))}
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
