import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageCircle, Coffee, Film } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

interface AgentData {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  city: string;
  bio: string;
  profile_photo_url: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
}

interface Post {
  id: string;
  photo_url: string;
  caption: string;
}

export default function AgentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduleType, setScheduleType] = useState<'coffee' | 'video'>('coffee');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [requestSent, setRequestSent] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadAgentData();
      loadFollowCounts();
      checkIfFollowing();
    }
  }, [id, profile?.id]);

  const loadAgentData = async () => {
    try {
      const { data: agentData, error: agentError } = await supabase
        .from('users')
        .select('id, first_name, last_name, role, city, profile_photo_url, bio, followers_count, following_count, posts_count, services')
        .eq('id', id)
        .single();

      if (agentError) throw agentError;
      setAgent(agentData);

      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', id)
        .eq('is_daily', false)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      setPosts(postsData || []);
    } catch (error) {
      console.error('Error loading agent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFollowCounts = async () => {
    if (!id) return;

    // Get follower count
    const { count: followersCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', id);

    // Get following count
    const { count: followingCountData } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', id);

    setFollowerCount(followersCount || 0);
    setFollowingCount(followingCountData || 0);
  };

  const checkIfFollowing = async () => {
    if (!profile?.id || !id) return;

    const { data } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', profile.id)
      .eq('following_id', id)
      .maybeSingle();

    setIsFollowing(!!data);
  };

  const handleFollowToggle = async () => {
    if (!profile?.id || !id) return;

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', profile.id)
          .eq('following_id', id);

        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
      } else {
        // Follow
        await supabase
          .from('follows')
          .insert({
            follower_id: profile.id,
            following_id: id,
          });

        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleScheduleClick = (type: 'coffee' | 'video') => {
    setScheduleType(type);
    setShowScheduleDialog(true);
  };

  const handleConfirmSchedule = async () => {
    if (!selectedDate || !selectedTime || !profile?.id || !id) return;

    try {
      await supabase
        .from('intros')
        .insert({
          buyer_id: profile.id,
          agent_id: id,
          type: scheduleType,
        });

      setShowScheduleDialog(false);
      setSelectedDate(undefined);
      setSelectedTime('');
      setRequestSent(scheduleType);
      setTimeout(() => setRequestSent(null), 3000);
    } catch (error) {
      console.error('Error scheduling meeting:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader title="Agent Profile" showLogo={false} />
        <div className="flex items-center justify-center p-6">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader title="Agent Profile" showLogo={false} />
        <div className="flex items-center justify-center p-6">
          <p className="text-muted-foreground">Agent not found</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Agent Profile" showLogo={false} />

      <div className="max-w-md mx-auto">
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={agent.profile_photo_url} alt="Profile" />
              <AvatarFallback>
                {agent.first_name[0]}{agent.last_name[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold">
                {agent.first_name} {agent.last_name}
              </h2>
              <p className="text-muted-foreground text-sm">
                {agent.role === 'Agent' ? 'Real Estate Agent' : 'Home Buyer'}
              </p>
              <p className="text-sm text-muted-foreground">
                {agent.city}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {profile?.id !== id && (
              <Button
                variant={isFollowing ? "outline" : "default"}
                className="flex-1"
                size="lg"
                onClick={handleFollowToggle}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
            {agent.role === 'Agent' && (
              <Button 
                className="flex-1" 
                size="lg"
                onClick={() => navigate(`/chat/${agent.id}`)}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Message Agent
              </Button>
            )}
          </div>

          {profile?.id !== id && agent.role === 'Agent' && (
            <>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 text-xs"
                  size="sm"
                  onClick={() => handleScheduleClick('coffee')}
                >
                  <Coffee className="mr-1.5 h-4 w-4" />
                  Schedule Coffee
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-xs"
                  size="sm"
                  onClick={() => handleScheduleClick('video')}
                >
                  <Film className="mr-1.5 h-4 w-4" />
                  Schedule Video Call
                </Button>
              </div>
              {requestSent && (
                <p className="text-sm text-primary text-center">
                  Request sent to this agent.
                </p>
              )}
            </>
          )}

          <p className="text-sm">
            {agent.bio}
          </p>

          <div className="flex gap-6 text-center">
            <div>
              <p className="font-bold text-lg">{posts.length}</p>
              <p className="text-sm text-muted-foreground">Snapshots</p>
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
        </div>

        <Tabs defaultValue="snapshots" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="snapshots" className="flex-1">Snapshots</TabsTrigger>
            {agent.role === 'Agent' && (
              <TabsTrigger value="services" className="flex-1">Services</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="snapshots" className="p-1">
            <div className="grid grid-cols-2 gap-1">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <img
                    key={post.id}
                    src={post.photo_url}
                    alt={post.caption || 'Post'}
                    className="w-full aspect-square object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => navigate(`/post/${post.id}`)}
                  />
                ))
              ) : (
                <p className="col-span-2 text-center text-muted-foreground py-8">
                  No snapshots yet
                </p>
              )}
            </div>
          </TabsContent>

          {agent.role === 'Agent' && (
            <TabsContent value="services" className="p-4">
              <div className="flex flex-wrap gap-2">
                {((agent as any).services || []).length > 0 ? (
                  ((agent as any).services || []).map((service: string, index: number) => {
                    // Get emoji for service
                    const getEmoji = (service: string) => {
                      const serviceEmojis: { [key: string]: string } = {
                        'First-time buyers': '🏡',
                        'VA loans': '🎖️',
                        'Relocation': '✈️',
                        'Off-market deals': '🔑',
                        'Coastal expert': '🌴',
                        'Luxury homes': '💎',
                        'Investment properties': '📈',
                        'Commercial real estate': '🏢',
                        'New construction': '🏗️',
                        'Foreclosures': '🔨',
                      };
                      for (const [key, emoji] of Object.entries(serviceEmojis)) {
                        if (service.toLowerCase().includes(key.toLowerCase())) {
                          return emoji;
                        }
                      }
                      return '⭐';
                    };

                    return (
                      <span key={index} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1">
                        <span>{getEmoji(service)}</span>
                        <span>{service}</span>
                      </span>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground text-sm">No services listed yet</p>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule a Meeting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Date</label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border pointer-events-auto"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Time</label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <Button 
              onClick={handleConfirmSchedule}
              disabled={!selectedDate || !selectedTime}
              className="w-full"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
