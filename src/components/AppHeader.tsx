import { NotificationBell } from './NotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import koiLogo from '@/assets/koi-logo-new.png';

interface AppHeaderProps {
  title?: string;
  showLogo?: boolean;
  useLogoImage?: boolean;
}

export const AppHeader = ({ title, showLogo = true, useLogoImage = false }: AppHeaderProps) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAgent = profile?.role === 'Agent';

  const handleBack = () => {
    // Define the main pages
    const mainPages = ['/', '/feed', '/search', '/messages', '/profile', '/pond'];
    
    // If we're on a main page, go to feed
    if (mainPages.includes(location.pathname)) {
      navigate('/feed');
    } else {
      // Otherwise go back
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
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
