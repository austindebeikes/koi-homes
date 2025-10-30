import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'Rachel',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rachel',
    lastMessage: 'Let me know if you have any questions!',
    timestamp: '2h ago',
    unread: true,
  },
  {
    id: '2',
    name: 'Jennifer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jennifer',
    lastMessage: "Hi Janna, I saw your new listing and I'm interested...",
    timestamp: '1d ago',
    unread: false,
  },
  {
    id: '3',
    name: 'Thomas',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thomas',
    lastMessage: 'That late works for me, Looking forward to it!',
    timestamp: '2d ago',
    unread: false,
  },
];

export default function Messages() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Messages" showLogo={false} />

      <div className="max-w-md mx-auto">
        {mockConversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => navigate(`/chat/${conversation.id}`)}
            className="flex items-center gap-4 p-4 border-b border-border hover:bg-accent transition-colors cursor-pointer"
          >
            <Avatar className="h-14 w-14">
              <AvatarImage src={conversation.avatar} />
              <AvatarFallback>{conversation.name[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold truncate">{conversation.name}</p>
                <p className="text-xs text-muted-foreground">{conversation.timestamp}</p>
              </div>
              <p className={`text-sm truncate ${conversation.unread ? 'font-semibold' : 'text-muted-foreground'}`}>
                {conversation.lastMessage}
              </p>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
