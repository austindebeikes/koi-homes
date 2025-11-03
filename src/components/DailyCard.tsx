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
    <div className="rounded-2xl p-6 mb-4 bg-[hsl(var(--dailys-bg))] border border-border/50 shadow-sm">
      {/* Header */}
      <div 
        className="flex items-center gap-3 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
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
        <p className="text-lg leading-relaxed font-serif text-foreground italic">
          &ldquo;{daily.caption}&rdquo;
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border/30">
        <p className="text-xs text-muted-foreground">
          {new Date(daily.created_at).toLocaleDateString()}
        </p>
        <Button
          size="sm"
          onClick={() => navigate(`/chat/${daily.user_id}`)}
        >
          <MessageCircle className="h-4 w-4" />
          Message
        </Button>
      </div>
    </div>
  );
}