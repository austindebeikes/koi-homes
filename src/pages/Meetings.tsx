import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Coffee, Film, MessageCircle } from 'lucide-react';

interface Meeting {
  id: string;
  type: 'coffee' | 'video';
  created_at: string;
  buyer_id: string;
  agent_id: string;
  buyer?: {
    first_name: string;
    last_name: string;
    profile_photo_url: string;
  };
}

export default function Meetings() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      loadMeetings();
    }
  }, [profile?.id]);

  const loadMeetings = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('agent_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Load buyer details for each meeting
      const meetingsWithBuyers = await Promise.all(
        (data || []).map(async (meeting) => {
          const { data: buyerData } = await supabase
            .from('users')
            .select('first_name, last_name, profile_photo_url')
            .eq('id', meeting.buyer_id)
            .single();

          return {
            ...meeting,
            type: meeting.type as 'coffee' | 'video',
            buyer: buyerData,
          };
        })
      );

      setMeetings(meetingsWithBuyers);
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader title="Meeting Requests" showLogo={false} />
        <div className="flex items-center justify-center p-6">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Meeting Requests" showLogo={false} />

      <div className="max-w-md mx-auto p-4">
        {meetings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No meeting requests yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="bg-card border border-border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={meeting.buyer?.profile_photo_url} />
                    <AvatarFallback>
                      {meeting.buyer?.first_name[0]}
                      {meeting.buyer?.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {meeting.buyer?.first_name} {meeting.buyer?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      {meeting.type === 'coffee' ? (
                        <>
                          <Coffee className="h-4 w-4" />
                          requested a Coffee Chat
                        </>
                      ) : (
                        <>
                          <Film className="h-4 w-4" />
                          requested a Video Call
                        </>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(meeting.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate(`/chat/${meeting.buyer_id}`)}
                  className="w-full gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
