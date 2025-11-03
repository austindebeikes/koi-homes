import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle, Calendar, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface DailyCardProps {
  daily: {
    id: string;
    caption: string;
    created_at: string;
    user_id: string;
    users: {
      id: string;
      first_name: string;
      last_name: string;
      city: string;
      profile_photo_url: string;
    };
  };
}

export function DailyCard({ daily }: DailyCardProps) {
  const navigate = useNavigate();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [meetingType, setMeetingType] = useState<'coffee' | 'video'>('coffee');

  return (
    <div className="rounded-2xl p-6 mb-4 bg-[hsl(var(--dailys-bg))] border border-border/50 shadow-[0_2px_8px_rgba(0,0,0,0.08)] animate-fade-in relative">
      {/* Daily's Badge */}
      <div className="absolute top-4 right-4">
        <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-semibold">
          <Calendar className="h-3 w-3" />
          <span>Daily&apos;s</span>
        </div>
      </div>

      {/* Header */}
      <div 
        className="flex items-center gap-3 mb-3 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate(`/agent/${daily.users.id}`)}
      >
        <Avatar className="h-10 w-10 border-2 border-primary/20">
          <AvatarImage src={daily.users.profile_photo_url} />
          <AvatarFallback>
            {daily.users.first_name[0]}{daily.users.last_name[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-foreground text-sm">
            {daily.users.first_name} {daily.users.last_name}
          </p>
          <p className="text-xs text-muted-foreground">{daily.users.city}</p>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-lg leading-relaxed font-serif italic text-foreground">
          &ldquo;{daily.caption}&rdquo;
        </p>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-border/30 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-normal">
            {new Date(daily.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-2">
          <Button
            size="sm"
            variant="accent"
            className="w-full gap-1.5 relative overflow-hidden group"
            onClick={() => navigate(`/messages/${daily.user_id}`)}
          >
            <span className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 rounded-full transition-transform duration-300 origin-center"></span>
            <MessageCircle className="h-4 w-4" />
            Message
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 relative overflow-hidden group"
              onClick={() => {
                setMeetingType('coffee');
                setShowScheduleModal(true);
              }}
            >
              <span className="absolute inset-0 bg-accent/10 scale-0 group-active:scale-100 rounded-full transition-transform duration-200 origin-center"></span>
              <Phone className="h-4 w-4" />
              Schedule Coffee Chat
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 relative overflow-hidden group"
              onClick={() => {
                setMeetingType('video');
                setShowScheduleModal(true);
              }}
            >
              <span className="absolute inset-0 bg-accent/10 scale-0 group-active:scale-100 rounded-full transition-transform duration-200 origin-center"></span>
              <Phone className="h-4 w-4" />
              Schedule Video Call
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Schedule a time to connect
          </p>
        </div>
      </div>

      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Schedule a Meeting
            </DialogTitle>
            <DialogDescription>
              Choose a date and time for your {meetingType === 'coffee' ? 'coffee chat' : 'video call'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Select Date</Label>
              <Input id="date" type="date" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Select Time</Label>
              <Input id="time" type="time" />
            </div>
            
            <Button 
              className="w-full" 
              variant="accent"
              onClick={() => setShowScheduleModal(false)}
            >
              Confirm Meeting
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}