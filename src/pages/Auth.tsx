import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshProfile } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isAgent, setIsAgent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You've been logged in successfully.",
        });
      } else {
        // Sign up flow
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('No user returned from signup');

        // Always attempt to sign in immediately to ensure a valid session
        let session = null;
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          // If sign-in failed but signup returned a session (edge case), use it
          if (authData.session) {
            session = authData.session;
          } else {
            throw signInError;
          }
        } else {
          session = signInData.session;
        }

        if (!session) throw new Error('Could not establish session');

        // Wait a moment to ensure session is fully propagated
        await new Promise(resolve => setTimeout(resolve, 100));

        // Create profile in public.users (now as authenticated user)
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: session.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
            role: isAgent ? 'Agent' : 'Buyer',
            city: 'San Diego, CA',
            bio: isAgent 
              ? 'Helping clients buy and sell homes. Passionate about real estate and connecting people with their dream properties.'
              : 'Looking for my dream home.',
            profile_photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
            followers_count: 0,
            following_count: 0,
            posts_count: 0,
          });

        if (profileError) throw profileError;

        // Refresh profile in context so the app has the latest data
        await refreshProfile?.();

        toast({
          title: "Account created!",
          description: "Welcome to Koi!",
        });
      }

      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during authentication.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title={isLogin ? "Log in" : "Sign up"} showLogo={false} />
      
      <div className="max-w-md mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isAgent"
                  checked={isAgent}
                  onCheckedChange={(checked) => setIsAgent(checked as boolean)}
                />
                <Label htmlFor="isAgent" className="cursor-pointer">
                  I'm a Real Estate Agent
                </Label>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLogin ? 'Log in' : 'Sign Up'}
          </Button>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
