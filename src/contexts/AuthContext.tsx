import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isMockMode: boolean;
  setMockUser: (email: string, metadata?: any) => void;
  addPost: (post: { imageUrl: string; caption: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isMockMode = !isSupabaseConfigured;

  useEffect(() => {
    if (!supabase) {
      // Mock mode - no auth needed
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    } else {
      // Mock mode - clear mock user
      setUser(null);
      setSession(null);
    }
  };

  const setMockUser = (email: string, metadata?: any) => {
    if (isMockMode) {
      const mockUser = {
        id: Math.random().toString(36).substring(7),
        email,
        user_metadata: {
          posts: [],
          ...metadata,
        },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;
      setUser(mockUser);
    }
  };

  const addPost = (post: { imageUrl: string; caption: string }) => {
    if (user?.user_metadata) {
      const currentPosts = user.user_metadata.posts || [];
      const updatedUser = {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          posts: [post, ...currentPosts],
        },
      } as User;
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, isMockMode, setMockUser, addPost }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
