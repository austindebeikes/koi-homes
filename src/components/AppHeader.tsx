import { NotificationBell } from './NotificationBell';
import { useAuth } from '@/contexts/AuthContext';

interface AppHeaderProps {
  title?: string;
  showLogo?: boolean;
}

export const AppHeader = ({ title, showLogo = true }: AppHeaderProps) => {
  const { profile } = useAuth();
  const isAgent = profile?.role === 'Agent';

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <div className="w-10" />
        {showLogo && (
          <h1 className="text-2xl font-heading text-foreground">koi</h1>
        )}
        {title && !showLogo && (
          <h1 className="text-xl font-heading text-foreground">{title}</h1>
        )}
        {isAgent ? <NotificationBell /> : <div className="w-10" />}
      </div>
    </header>
  );
};
