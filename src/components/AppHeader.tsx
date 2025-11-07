import { NotificationBell } from './NotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AppHeaderProps {
  title?: string;
  showLogo?: boolean;
}

export const AppHeader = ({ title, showLogo = true }: AppHeaderProps) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const isAgent = profile?.role === 'Agent';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="h-8 w-8"
        >
          <LogOut className="h-4 w-4" />
        </Button>
        {showLogo && (
          <h1 className="text-2xl font-sans lowercase text-primary font-semibold">koi</h1>
        )}
        {title && !showLogo && (
          <h1 className="text-xl font-sans text-foreground font-semibold">{title}</h1>
        )}
        {isAgent ? <NotificationBell /> : <div className="w-10" />}
      </div>
    </header>
  );
};
