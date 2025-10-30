import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading, isMockMode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      // In mock mode, always show auth page
      // In real mode, show feed if logged in, auth otherwise
      if (isMockMode || !user) {
        navigate('/auth');
      } else {
        navigate('/feed');
      }
    }
  }, [user, loading, isMockMode, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default Index;
