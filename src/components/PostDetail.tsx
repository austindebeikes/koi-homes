import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PostDetailProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Comment {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  users: {
    first_name: string;
    last_name: string;
    profile_photo_url: string;
  };
}

export const PostDetail = ({ postId, open, onOpenChange }: PostDetailProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && postId) {
      loadPostData();
    }
  }, [open, postId]);

  const loadPostData = async () => {
    setLoading(true);
    try {
      // Load post
      const { data: postData } = await supabase
        .from('posts')
        .select('*, users(first_name, last_name, profile_photo_url)')
        .eq('id', postId)
        .single();

      setPost(postData);

      // Load comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*, users(first_name, last_name, profile_photo_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      setComments(commentsData || []);

      // Load likes
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      setLikeCount(count || 0);

      // Check if user liked
      if (profile?.id) {
        const { data: userLike } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', profile.id)
          .maybeSingle();

        setLiked(!!userLike);
      }
    } catch (error) {
      console.error('Error loading post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!profile?.id) return;

    try {
      if (liked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', profile.id);
        
        setLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: profile.id });
        
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddComment = async () => {
    if (!profile?.id || !newComment.trim()) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: profile.id,
          body: newComment.trim(),
        })
        .select('*, users(first_name, last_name, profile_photo_url)')
        .single();

      if (error) throw error;

      setComments([...comments, data]);
      setNewComment('');
      
      toast({
        title: "Comment added!",
        description: "Your comment has been posted.",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment.",
        variant: "destructive",
      });
    }
  };

  if (loading || !post) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <p className="text-center py-8">Loading...</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={post.users.profile_photo_url} />
                <AvatarFallback>
                  {post.users.first_name[0]}{post.users.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">
                  {post.users.first_name} {post.users.last_name}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <img
              src={post.photo_url}
              alt={post.caption || 'Post'}
              className="w-full object-contain max-h-[400px]"
            />

            <div className="p-4 space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className="p-0 h-auto"
                >
                  <Heart
                    className={`h-6 w-6 ${liked ? 'fill-primary text-primary' : ''}`}
                  />
                </Button>
                <span className="text-sm font-semibold">{likeCount} likes</span>
              </div>

              {post.caption && (
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-semibold mr-2">
                      {post.users.first_name} {post.users.last_name}
                    </span>
                    {post.caption}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.users.profile_photo_url} />
                      <AvatarFallback>
                        {comment.users.first_name[0]}{comment.users.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold mr-2">
                          {comment.users.first_name} {comment.users.last_name}
                        </span>
                        {comment.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={1}
                className="resize-none"
              />
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
