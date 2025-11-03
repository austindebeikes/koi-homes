import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle, Calendar } from 'lucide-react';
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
      <div className="flex items-center justify-between pt-4 border-t border-border/30">
        <p className="text-xs text-muted-foreground font-normal">
          {new Date(daily.created_at).toLocaleDateString()}
        </p>
        <Button
          size="sm"
          onClick={() => navigate(`/chat/${daily.user_id}`)}
          className="relative overflow-hidden group"
        >
          <span className="absolute inset-0 bg-primary/20 rounded-full scale-0 group-active:scale-100 transition-transform duration-300 ease-out origin-center"></span>
          <MessageCircle className="h-4 w-4 relative z-10" />
          <span className="relative z-10">Message</span>
        </Button>
      </div>
    </div>
  );
}