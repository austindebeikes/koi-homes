import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function EditProfile() {
  const { user, setMockUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profilePhoto, setProfilePhoto] = useState(
    user?.user_metadata?.profile_photo || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop'
  );
  const [firstName, setFirstName] = useState(user?.user_metadata?.first_name || '');
  const [lastName, setLastName] = useState(user?.user_metadata?.last_name || '');
  const [city, setCity] = useState(user?.user_metadata?.city || 'San Diego, CA');
  const [bio, setBio] = useState(
    user?.user_metadata?.bio || 'Helping clients buy and sell homes. Passionate about real estate and connecting people with their dream properties.'
  );
  const [phone, setPhone] = useState(user?.user_metadata?.phone || '');

  const handleSave = () => {
    // Update mock user with new data
    if (user) {
      setMockUser(user.email || '', {
        first_name: firstName,
        last_name: lastName,
        role: user.user_metadata?.role,
        city,
        bio,
        phone,
        profile_photo: profilePhoto,
      });

      toast({
        title: "Profile updated!",
        description: "Your changes have been saved.",
      });

      navigate('/profile');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Edit Profile" showLogo={false} />

      <div className="max-w-md mx-auto p-6 space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profilePhoto} alt="Profile" />
            <AvatarFallback>
              {firstName?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="w-full space-y-2">
            <Label htmlFor="profilePhoto">Profile Photo URL</Label>
            <Input
              id="profilePhoto"
              type="url"
              value={profilePhoto}
              onChange={(e) => setProfilePhoto(e.target.value)}
              placeholder="https://example.com/photo.jpg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City / Market</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="San Diego, CA"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/profile')}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
