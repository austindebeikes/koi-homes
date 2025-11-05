import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  city: string;
  profile_photo_url: string;
  isFollowing?: boolean;
}

interface FollowersListProps {
  userId: string;
  type: 'followers' | 'following';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FollowersList = ({ userId, type, open, onOpenChange }: FollowersListProps) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open, userId, type]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Get follower/following IDs
      const { data: followData, error: followError } = await supabase
        .from('follows')
        .select('follower_id, following_id')
        .eq(type === 'followers' ? 'following_id' : 'follower_id', userId);

      if (followError) throw followError;

      const userIds = followData?.map(f => 
        type === 'followers' ? f.follower_id : f.following_id
      ) || [];

      if (userIds.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      // Get user details
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, role, city, profile_photo_url')
        .in('id', userIds);

      if (usersError) throw usersError;

      // Check if current user is following these users
      const usersWithFollowStatus = await Promise.all(
        (usersData || []).map(async (user) => {
          if (!profile?.id || user.id === profile.id) {
            return { ...user, isFollowing: false };
          }

          const { data } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', profile.id)
            .eq('following_id', user.id)
            .maybeSingle();

          return { ...user, isFollowing: !!data };
        })
      );

      setUsers(usersWithFollowStatus);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (targetUserId: string, currentlyFollowing: boolean) => {
    if (!profile?.id) return;

    try {
      if (currentlyFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', profile.id)
          .eq('following_id', targetUserId);
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: profile.id,
            following_id: targetUserId,
          });
      }

      setUsers(users.map(u =>
        u.id === targetUserId ? { ...u, isFollowing: !currentlyFollowing } : u
      ));
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleUserClick = (user: User) => {
    onOpenChange(false);
    if (user.id === profile?.id) {
      navigate('/profile');
    } else if (user.role === 'Agent') {
      navigate(`/agent/${user.id}`);
    } else {
      navigate(`/agent/${user.id}`); // Will show buyer view
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{type === 'followers' ? 'Followers' : 'Following'}</DialogTitle>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No {type === 'followers' ? 'followers' : 'following'} yet
            </p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent">
                  <div
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => handleUserClick(user)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profile_photo_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.first_name[0]}{user.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.role === 'Agent' ? 'Real Estate Agent' : 'Home Buyer'}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.city}</p>
                    </div>
                  </div>
                  {user.id !== profile?.id && (
                    user.role === 'Agent' ? (
                      <Button
                        variant={user.isFollowing ? 'outline' : 'default'}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowToggle(user.id, user.isFollowing || false);
                        }}
                      >
                        {user.isFollowing ? 'Following' : 'Follow'}
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenChange(false);
                          navigate(`/chat/${user.id}`);
                        }}
                      >
                        Message
                      </Button>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
