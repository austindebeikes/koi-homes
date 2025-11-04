import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Notification {
  id: string;
  type: string;
  message: string;
  related_user_id: string | null;
  related_post_id: string | null;
  is_read: boolean;
  created_at: string;
  related_user?: {
    first_name: string;
    last_name: string;
    profile_photo_url: string;
  };
}

export const NotificationBell = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;

    loadNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`,
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const loadNotifications = async () => {
    if (!profile?.id) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading notifications:', error);
      return;
    }

    // Load related user data separately
    const notificationsWithUsers = await Promise.all(
      (data || []).map(async (notification) => {
        if (notification.related_user_id) {
          const { data: userData } = await supabase
            .from('users')
            .select('first_name, last_name, profile_photo_url')
            .eq('id', notification.related_user_id)
            .single();
          
          return {
            ...notification,
            related_user: userData,
          };
        }
        return notification;
      })
    );

    setNotifications(notificationsWithUsers);
    setUnreadCount(notificationsWithUsers.filter(n => !n.is_read).length);
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    loadNotifications();
  };

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);
    setOpen(false);
    
    if (notification.related_user_id) {
      navigate(`/agent/${notification.related_user_id}`);
    }
  };

  if (!profile) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              No notifications yet
            </p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b cursor-pointer hover:bg-accent/5 transition-colors ${
                  !notification.is_read ? 'bg-accent/10' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-3">
                  {notification.related_user && (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={notification.related_user.profile_photo_url} />
                      <AvatarFallback>
                        {notification.related_user.first_name[0]}
                        {notification.related_user.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
