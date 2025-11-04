import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  created_at: string;
}

interface OtherUser {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  profile_photo_url: string;
}

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && profile?.id) {
      loadChatData();
      markMessagesAsRead();
    }
  }, [id, profile?.id]);

  const markMessagesAsRead = async () => {
    if (!id || !profile?.id) return;

    // Mark all messages from this user as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', id)
      .eq('receiver_id', profile.id)
      .eq('is_read', false);
  };

  const loadChatData = async () => {
    if (!id || !profile?.id) return;

    try {
      // Load other user's data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, first_name, last_name, role, profile_photo_url')
        .eq('id', id)
        .single();

      if (userError) throw userError;
      setOtherUser(userData);

      // Load messages
      await loadMessages();
    } catch (error) {
      console.error('Error loading chat data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!id || !profile?.id) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${profile.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const handleSend = async () => {
    if (!message.trim() || !profile?.id || !id) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: profile.id,
          receiver_id: id,
          body: message.trim(),
        });

      if (error) throw error;

      setMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/messages')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser.profile_photo_url} alt={`${otherUser.first_name} ${otherUser.last_name}`} />
            <AvatarFallback>{otherUser.first_name[0]}{otherUser.last_name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{otherUser.first_name} {otherUser.last_name}</p>
            <p className="text-sm text-muted-foreground">
              {otherUser.role === 'Agent' ? 'Real Estate Agent' : 'Home Buyer'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.sender_id === profile?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{msg.body}</p>
                <p className={`text-xs mt-1 ${msg.sender_id === profile?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
