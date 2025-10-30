import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { Heart } from 'lucide-react';

export default function Likes() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Activity" showLogo={false} />

      <div className="max-w-md mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Heart className="h-20 w-20 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No activity yet</h2>
        <p className="text-muted-foreground text-center">
          When someone likes or comments on your posts, you'll see them here.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
