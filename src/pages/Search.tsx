import { useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Agent {
  id: string;
  name: string;
  location: string;
  profilePhotoUrl: string;
  followers: number;
}

const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Kelly Johnson',
    location: 'Los Angeles, CA',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    followers: 1250,
  },
  {
    id: '2',
    name: 'Michael Lee',
    location: 'Austin, TX',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    followers: 890,
  },
  {
    id: '3',
    name: 'Sarah Mitchell',
    location: 'San Diego, CA',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    followers: 2100,
  },
];

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [agents] = useState<Agent[]>(mockAgents);
  const navigate = useNavigate();

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Agent search" showLogo={false} />

      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search agents"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-4">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center gap-4 p-4 rounded-lg hover:bg-accent transition-colors cursor-pointer"
              onClick={() => navigate(`/agent/${agent.id}`)}
            >
              <Avatar className="h-16 w-16">
                <AvatarImage src={agent.profilePhotoUrl} />
                <AvatarFallback>{agent.name[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{agent.name}</p>
                <p className="text-sm text-muted-foreground">Real Estate Agent</p>
                <p className="text-sm text-muted-foreground">{agent.location}</p>
                <p className="text-sm text-muted-foreground">{agent.followers} followers</p>
              </div>

              <Button variant="default">Follow</Button>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
