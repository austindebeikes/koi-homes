import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send } from 'lucide-react';
import { mockUsers } from '@/lib/mockData';

interface Message {
  id: string;
  text: string;
  isOwn: boolean;
  timestamp: string;
}

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const otherUser = id ? mockUsers[id] : null;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi Sarah! I saw Yoast you're interested in 24 Fall view Ave. I'd like to schedule a tour?",
      isOwn: false,
      timestamp: '10:30 AM',
    },
    {
      id: '2',
      text: 'Yes, that sounds good!',
      isOwn: true,
      timestamp: '10:32 AM',
    },
  ]);

  const handleSend = () => {
    if (message.trim()) {
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          text: message,
          isOwn: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="hover:text-primary">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser?.profilePhotoUrl} />
            <AvatarFallback>
              {otherUser?.firstName?.[0]}{otherUser?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">
              {otherUser?.firstName} {otherUser?.lastName}
            </p>
            <p className="text-xs text-muted-foreground">
              {otherUser?.role === 'Agent' ? 'Real Estate Agent' : 'Home Buyer'}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-md mx-auto w-full">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                msg.isOwn
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 border-t border-border bg-background">
        <div className="max-w-md mx-auto p-4 flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
