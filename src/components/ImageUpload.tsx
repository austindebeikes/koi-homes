import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X } from 'lucide-react';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
  label?: string;
  className?: string;
  bucketName: string;
  acceptVideo?: boolean;
  maxDuration?: number;
}

export const ImageUpload = ({ 
  onUploadComplete, 
  currentImageUrl, 
  label = "Photo",
  className = "",
  bucketName,
  acceptVideo = false,
  maxDuration = 5
}: ImageUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && (!acceptVideo || !isVideo)) {
      toast({
        title: "Invalid file type",
        description: acceptVideo ? "Please select an image or video file." : "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate video duration if video
    if (isVideo && acceptVideo) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      const durationCheck = new Promise<boolean>((resolve) => {
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > maxDuration) {
            toast({
              title: "Video too long",
              description: `Please select a video under ${maxDuration} seconds.`,
              variant: "destructive",
            });
            resolve(false);
          } else {
            resolve(true);
          }
        };
      });
      
      video.src = URL.createObjectURL(file);
      const isValidDuration = await durationCheck;
      if (!isValidDuration) return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      setPreviewUrl(publicUrl);
      onUploadComplete(publicUrl);

      toast({
        title: "Upload successful!",
        description: "Your photo has been uploaded.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload photo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Label>{label}</Label>
      
      {previewUrl && (
        <div className="relative">
          {previewUrl.includes('video') || previewUrl.match(/\.(mp4|mov|avi|webm)$/i) ? (
            <video
              src={previewUrl}
              controls
              className="w-full aspect-square object-cover rounded-lg"
            />
          ) : (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full aspect-square object-cover rounded-lg"
            />
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {previewUrl ? 'Change Photo' : 'Upload Photo'}
            </>
          )}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptVideo ? "image/*,video/*" : "image/*"}
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground">
        {acceptVideo 
          ? `Choose from camera roll or take a new photo/video (max 5MB, ${maxDuration}s for video)`
          : 'Choose from camera roll or take a new photo (max 5MB)'}
      </p>
    </div>
  );
};
