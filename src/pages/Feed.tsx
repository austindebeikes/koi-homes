import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { Heart, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Post {
  id: string;
  agentName: string;
  agentAvatar: string;
  image: string;
  caption: string;
  likes: number;
  timestamp: string;
}

const mockPosts: Post[] = [
  {
    id: '1',
    agentName: 'Sarah Mitchell',
    agentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    caption: 'Just listed this beautiful home in Austin! 🏡',
    likes: 42,
    timestamp: '2h ago',
  },
  {
    id: '2',
    agentName: 'Michael Lee',
    agentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    caption: 'Excited to show this property today! ✨',
    likes: 38,
    timestamp: '5h ago',
  },
];

export default function Feed() {
  const { user, isMockMode } = useAuth();
  const navigate = useNavigate();
  const [posts] = useState<Post[]>(mockPosts);

  useEffect(() => {
    // Only redirect if not in mock mode and no user
    if (!isMockMode && !user) {
      navigate('/auth');
    }
  }, [user, isMockMode, navigate]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader />

      <div className="max-w-md mx-auto">
        {posts.map((post) => (
          <article key={post.id} className="border-b border-border">
            <div className="p-4 flex items-center gap-3">
              <Avatar>
                <AvatarImage src={post.agentAvatar} />
                <AvatarFallback>{post.agentName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{post.agentName}</p>
                <p className="text-sm text-muted-foreground">{post.timestamp}</p>
              </div>
            </div>

            <img
              src={post.image}
              alt={post.caption}
              className="w-full aspect-square object-cover"
            />

            <div className="p-4 space-y-3">
              <div className="flex gap-4">
                <button className="hover:text-primary transition-colors">
                  <Heart className="h-6 w-6" />
                </button>
                <button className="hover:text-primary transition-colors">
                  <MessageCircle className="h-6 w-6" />
                </button>
              </div>

              <p className="font-semibold">{post.likes} likes</p>
              <p>
                <span className="font-semibold">{post.agentName}</span>{' '}
                {post.caption}
              </p>
            </div>
          </article>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
