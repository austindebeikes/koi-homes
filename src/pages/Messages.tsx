import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Conversation {
  id: string;
  other_user_id: string;
  first_name: string;
  last_name: string;
  profile_photo_url: string;
  last_message: string;
  last_message_time: string;
  isUnread: boolean;
}

export default function Messages() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      loadConversations();
    }
  }, [profile?.id]);

  const loadConversations = async () => {
    if (!profile?.id) return;

    try {
      // Get all messages where user is sender or receiver
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by conversation partner
      const conversationMap = new Map<string, any>();
      
      for (const msg of messages || []) {
        const otherUserId = msg.sender_id === profile.id ? msg.receiver_id : msg.sender_id;
        
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            other_user_id: otherUserId,
            last_message: msg.body,
            last_message_time: msg.created_at,
            is_unread: msg.receiver_id === profile.id && !msg.is_read,
          });
        }
      }

      // Fetch user details for each conversation partner
      const userIds = Array.from(conversationMap.keys());
      if (userIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, profile_photo_url')
        .in('id', userIds);

      if (usersError) throw usersError;

      // Combine conversation data with user details
      const conversationsData = users?.map(user => {
        const convData = conversationMap.get(user.id);
        
        return {
          id: user.id,
          other_user_id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          profile_photo_url: user.profile_photo_url,
          last_message: convData.last_message,
          last_message_time: convData.last_message_time,
          isUnread: convData.is_unread,
        };
      }) || [];

      setConversations(conversationsData);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader title="Messages" />
        <div className="flex items-center justify-center p-6">
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Messages" />

      <div className="max-w-md mx-auto">
        {conversations.length === 0 ? (
          <div className="flex items-center justify-center p-6">
            <p className="text-muted-foreground">No conversations yet. Start messaging agents!</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => navigate(`/chat/${conversation.other_user_id}`)}
              className="flex items-center gap-3 p-4 hover:bg-accent cursor-pointer border-b border-border"
            >
              <Avatar className="h-14 w-14">
                <AvatarImage src={conversation.profile_photo_url} alt={`${conversation.first_name} ${conversation.last_name}`} />
                <AvatarFallback>{conversation.first_name[0]}{conversation.last_name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <p className={conversation.isUnread ? "font-bold" : "font-semibold"}>
                    {conversation.first_name} {conversation.last_name}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(conversation.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className={`text-sm truncate ${conversation.isUnread ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                  {conversation.last_message}
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
