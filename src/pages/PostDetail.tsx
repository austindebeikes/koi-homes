import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Heart, Send } from 'lucide-react';

interface Post {
  id: string;
  user_id: string;
  photo_url: string;
  caption: string | null;
  created_at: string;
  users: {
    id: string;
    first_name: string;
    last_name: string;
    city: string;
    profile_photo_url: string;
  };
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

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPostData();
    }
  }, [id]);

  const loadPostData = async () => {
    try {
      // Load post
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('*, users(*)')
        .eq('id', id)
        .single();

      if (postError) throw postError;
      setPost(postData);

      // Load comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments' as any)
        .select('*, users(first_name, last_name, profile_photo_url)')
        .eq('post_id', id)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;
      setComments((commentsData as any) || []);

      // Load likes count
      const { count, error: likesCountError } = await supabase
        .from('likes' as any)
        .select('*', { count: 'exact', head: true })
        .eq('post_id', id);

      if (likesCountError) throw likesCountError;
      setLikeCount(count || 0);

      // Check if current user liked
      if (profile?.id) {
        const { data: userLike, error: userLikeError } = await supabase
          .from('likes' as any)
          .select('id')
          .eq('post_id', id)
          .eq('user_id', profile.id)
          .maybeSingle();

        if (userLikeError) throw userLikeError;
        setIsLiked(!!userLike);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to like posts",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes' as any)
          .delete()
          .eq('post_id', id)
          .eq('user_id', profile.id);

        if (error) throw error;
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        // Like
        const { error } = await supabase
          .from('likes' as any)
          .insert({ post_id: id, user_id: profile.id });

        if (error) throw error;
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const handleCommentSubmit = async () => {
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments' as any)
        .insert({
          post_id: id,
          user_id: profile.id,
          body: commentText.trim(),
        });

      if (error) throw error;

      setCommentText('');
      await loadPostData(); // Refresh to show new comment

      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Post" showLogo={false} />
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Post" showLogo={false} />
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Post not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      <AppHeader title="Post" showLogo={false} />

      <div className="max-w-2xl mx-auto p-4">
        {/* Post Image */}
        <img
          src={post.photo_url}
          alt="Post"
          className="w-full aspect-square object-cover rounded-lg mb-4"
        />

        {/* User Info */}
        <div className="flex items-center gap-3 mb-4">
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
            <p className="text-sm text-muted-foreground">{post.users.city}</p>
          </div>
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="mb-4 text-foreground">{post.caption}</p>
        )}

        {/* Like Button */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant={isLiked ? "default" : "outline"}
            size="sm"
            onClick={handleLikeToggle}
            className="gap-2"
          >
            <Heart className={isLiked ? "fill-current" : ""} />
            {likeCount} {likeCount === 1 ? 'like' : 'likes'}
          </Button>
        </div>

        {/* Comments Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Comments</h3>

          {/* Comment Input */}
          <div className="flex gap-2">
            <Textarea
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={2}
              className="flex-1"
            />
            <Button
              onClick={handleCommentSubmit}
              disabled={isSubmitting || !commentText.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-sm">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.users.profile_photo_url} />
                    <AvatarFallback>
                      {comment.users.first_name[0]}{comment.users.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">
                      {comment.users.first_name} {comment.users.last_name}
                    </p>
                    <p className="text-sm text-foreground">{comment.body}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
