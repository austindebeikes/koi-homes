import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div className="border-2 border-primary/20 rounded-lg p-4 mb-4 bg-background/50">
      {/* Header */}
      <div 
        className="flex items-center gap-3 mb-3 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate(`/agent/${daily.users.id}`)}
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={daily.users.profile_photo_url} />
          <AvatarFallback>
            {daily.users.first_name[0]}{daily.users.last_name[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-foreground">
            {daily.users.first_name} {daily.users.last_name}
          </p>
          <p className="text-xs text-muted-foreground">{daily.users.city}</p>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-base leading-relaxed font-serif text-foreground">
          {daily.caption}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {new Date(daily.created_at).toLocaleDateString()}
        </p>
        <Button
          size="sm"
          onClick={() => navigate(`/chat/${daily.user_id}`)}
          className="gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          Message Agent
        </Button>
      </div>
    </div>
  );
}