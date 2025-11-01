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

export default function NewPost() {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrl.trim()) {
      toast({
        title: "Image URL required",
        description: "Please provide a photo URL for your post.",
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

    setIsSubmitting(true);
    
    try {
      // Insert post into Supabase
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: profile.id,
          photo_url: imageUrl.trim(),
          caption: caption.trim(),
        });

      if (error) throw error;

      // Refresh profile to update post count
      await refreshProfile();

      toast({
        title: "Post created!",
        description: "Your new post has been added to your profile.",
      });

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
          <ImageUpload
            onUploadComplete={(url) => setImageUrl(url)}
            currentImageUrl={imageUrl}
            label="Post Photo"
          />

          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              placeholder="Write a caption for your post..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
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
