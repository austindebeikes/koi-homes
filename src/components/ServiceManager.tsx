import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ServiceManagerProps {
  services: string[];
  onServicesChange: (services: string[]) => void;
}

const serviceEmojis: { [key: string]: string } = {
  'First-time buyers': '🏡',
  'VA loans': '🎖️',
  'Relocation': '✈️',
  'Off-market deals': '🔑',
  'Coastal expert': '🌴',
  'Luxury homes': '💎',
  'Investment properties': '📈',
  'Commercial real estate': '🏢',
  'New construction': '🏗️',
  'Foreclosures': '🔨',
};

export function ServiceManager({ services, onServicesChange }: ServiceManagerProps) {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [newService, setNewService] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddService = async () => {
    if (!newService.trim() || !profile?.id) return;

    const updatedServices = [...services, newService.trim()];
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ services: updatedServices })
        .eq('id', profile.id);

      if (error) throw error;

      onServicesChange(updatedServices);
      setNewService('');
      setIsAdding(false);
      await refreshProfile();
      
      toast({
        title: "Service added",
        description: "Your service has been added successfully.",
      });
    } catch (error) {
      console.error('Error adding service:', error);
      toast({
        title: "Error",
        description: "Failed to add service.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveService = async (serviceToRemove: string) => {
    if (!profile?.id) return;

    const updatedServices = services.filter(s => s !== serviceToRemove);
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ services: updatedServices })
        .eq('id', profile.id);

      if (error) throw error;

      onServicesChange(updatedServices);
      await refreshProfile();
      
      toast({
        title: "Service removed",
        description: "Your service has been removed successfully.",
      });
    } catch (error) {
      console.error('Error removing service:', error);
      toast({
        title: "Error",
        description: "Failed to remove service.",
        variant: "destructive",
      });
    }
  };

  const getEmoji = (service: string) => {
    // Find matching emoji
    for (const [key, emoji] of Object.entries(serviceEmojis)) {
      if (service.toLowerCase().includes(key.toLowerCase())) {
        return emoji;
      }
    }
    return '⭐'; // default emoji
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {services.map((service, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
          >
            <span>{getEmoji(service)}</span>
            <span>{service}</span>
            <button
              onClick={() => handleRemoveService(service)}
              className="hover:text-primary/80 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {isAdding ? (
        <div className="flex gap-2">
          <Input
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            placeholder="Enter service name"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddService();
              }
            }}
          />
          <Button onClick={handleAddService} size="sm">
            Add
          </Button>
          <Button onClick={() => setIsAdding(false)} size="sm" variant="outline">
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => setIsAdding(true)}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      )}
    </div>
  );
}