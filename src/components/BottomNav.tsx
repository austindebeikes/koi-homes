import { Home, Search, MessageCircle, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

export const BottomNav = () => {
  const location = useLocation();
  const { profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!profile?.id) return;

    const loadUnreadCount = async () => {
      // Get the most recent message from each sender to the current user
      const { data: allMessages } = await supabase
        .from('messages')
        .select('sender_id, receiver_id, created_at')
        .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (!allMessages) {
        setUnreadCount(0);
        return;
      }

      // Group messages by conversation partner
      const conversationPartners = new Set<string>();
      const lastReadTimes = new Map<string, Date>();

      // For each conversation, find the last message the user SENT
      for (const msg of allMessages) {
        const partnerId = msg.sender_id === profile.id ? msg.receiver_id : msg.sender_id;
        
        if (msg.sender_id === profile.id && !lastReadTimes.has(partnerId)) {
          // This is a message the user sent - marks when they last interacted
          lastReadTimes.set(partnerId, new Date(msg.created_at));
        }
      }

      // Count conversations where there are newer messages from the partner
      let unreadConversations = 0;
      for (const msg of allMessages) {
        if (msg.receiver_id === profile.id) {
          const partnerId = msg.sender_id;
          const lastSentToPartner = lastReadTimes.get(partnerId);
          const msgDate = new Date(msg.created_at);
          
          // If we haven't sent them anything, or they sent after our last message
          if (!lastSentToPartner || msgDate > lastSentToPartner) {
            if (!conversationPartners.has(partnerId)) {
              conversationPartners.add(partnerId);
              unreadConversations++;
            }
          }
        }
      }

      setUnreadCount(unreadConversations);
    };

    loadUnreadCount();

    // Subscribe to new messages
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${profile.id}`
        },
        () => {
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const navItems = [
    { icon: Home, label: 'Home', path: '/feed' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-4">
        {navItems.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full transition-colors relative",
              location.pathname === path
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-6 w-6 mb-1" />
            <span className="text-xs">{label}</span>
            {label === 'Messages' && unreadCount > 0 && (
              <span className="absolute top-2 right-1/4 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
};
