import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface Agent {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  city: string;
  profile_photo_url: string;
}

export default function Search() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, role, city, profile_photo_url, bio, followers_count, following_count, posts_count')
        .eq('role', 'Agent')
        .order('first_name');

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter(
    (agent) =>
      agent.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader title="Search" />
        <div className="flex items-center justify-center p-6">
          <p className="text-muted-foreground">Loading agents...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Search" />

      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents by name or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => navigate(`/agent/${agent.id}`)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={agent.profile_photo_url} alt={`${agent.first_name} ${agent.last_name}`} />
                <AvatarFallback>{agent.first_name[0]}{agent.last_name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{agent.first_name} {agent.last_name}</p>
                <p className="text-sm text-muted-foreground">Real Estate Agent</p>
                <p className="text-sm text-muted-foreground">{agent.city}</p>
              </div>
              <Button variant="default" size="sm">
                Follow
              </Button>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
