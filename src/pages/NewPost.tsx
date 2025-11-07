import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ImageUpload';
import { Camera } from 'lucide-react';

export default function NewPost() {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postType, setPostType] = useState<'photo' | 'daily'>('photo');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (postType === 'photo' && !imageUrl.trim()) {
      toast({
        title: "Image URL required",
        description: "Please provide a photo URL for your post.",
        variant: "destructive",
      });
      return;
    }

    if (postType === 'daily' && !caption.trim()) {
      toast({
        title: "Content required",
        description: "Please write some content for your daily update.",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a post.",
        variant: "destructive",
      });
      return;
    }

    // Check if user is agent for daily posts
    if (postType === 'daily' && profile.role !== 'Agent') {
      toast({
        title: "Not allowed",
        description: "Only agents can create Daily updates.",
        variant: "destructive",
      });
      return;
    }

    // Check for existing daily in last 24 hours
    if (postType === 'daily') {
      const { data: existingDaily } = await supabase
        .from('posts')
        .select('id, created_at')
        .eq('user_id', profile.id)
        .eq('is_daily', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingDaily) {
        const postAge = Date.now() - new Date(existingDaily.created_at).getTime();
        const hoursSincePost = postAge / (1000 * 60 * 60);
        if (hoursSincePost < 24) {
          toast({
            title: "Daily already posted",
            description: "You've already posted your Daily. You can post another in 24 hours.",
            variant: "destructive",
          });
          return;
        }
      }
    }

    setIsSubmitting(true);
    
    try {
      // Insert post into Supabase
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: profile.id,
          photo_url: postType === 'photo' ? imageUrl.trim() : '',
          caption: caption.trim(),
          is_daily: postType === 'daily',
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: postType === 'daily' ? "Your Daily has been posted." : "Your snapshot has been posted.",
      });

      // Refresh profile to update post count
      await refreshProfile();

      // Navigate back to profile
      navigate('/profile');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create post.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Create Post" showLogo={false} />

      <div className="max-w-md mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {profile?.role === 'Agent' && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant={postType === 'photo' ? 'default' : 'outline'}
                className="flex-1 gap-2"
                onClick={() => setPostType('photo')}
              >
                <Camera className="h-4 w-4" />
                Snapshot
              </Button>
              <Button
                type="button"
                variant={postType === 'daily' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setPostType('daily')}
              >
                Daily Update
              </Button>
            </div>
          )}

          {postType === 'photo' && (
            <ImageUpload
              onUploadComplete={(url) => setImageUrl(url)}
              currentImageUrl={imageUrl}
              label="Post Photo"
              bucketName="post-photos"
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="caption">{postType === 'photo' ? 'Caption' : 'Daily Update'}</Label>
            <Textarea
              id="caption"
              placeholder={postType === 'photo' 
                ? 'Write a caption for your post...' 
                : 'Share a quick update with your followers...'}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={postType === 'daily' ? 6 : 4}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/profile')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              Post
            </Button>
          </div>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}
