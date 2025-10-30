import { useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockUsers } from '@/lib/mockData';

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const agents = Object.values(mockUsers).filter(user => user.role === 'Agent');

  const filteredAgents = agents.filter((agent) =>
    `${agent.firstName} ${agent.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.city.toLowerCase().includes(searchQuery.toLowerCase())
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
                <AvatarFallback>{agent.firstName[0]}{agent.lastName[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{agent.firstName} {agent.lastName}</p>
                <p className="text-sm text-muted-foreground">Real Estate Agent</p>
                <p className="text-sm text-muted-foreground">{agent.city}</p>
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
