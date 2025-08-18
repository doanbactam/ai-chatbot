'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { Search, Plus, X, Users, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AiGroup, AiAgent } from '@/lib/db/schema';
import { Label } from '@/components/ui/label';

interface GroupMembersManagerProps {
  group: AiGroup;
  agents: AiAgent[];
  groupAgents: Array<AiAgent & { localEnabled: boolean }>;
  isLoadingGroupAgents?: boolean;
  error?: Error;
  onClose: () => void;
}

export function GroupMembersManager({ 
  group, 
  agents, 
  groupAgents, 
  isLoadingGroupAgents = false,
  error,
  onClose 
}: GroupMembersManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [isAddingAgent, setIsAddingAgent] = useState(false);

  // Filter available agents (not already in group)
  const availableAgents = useMemo(() => {
    const groupAgentIds = new Set(groupAgents.map(ga => ga.id));
    return agents.filter(agent => !groupAgentIds.has(agent.id));
  }, [agents, groupAgents]);

  // Filter available agents based on search query
  const filteredAvailableAgents = useMemo(() => {
    if (!searchQuery.trim()) return availableAgents;
    
    const query = searchQuery.toLowerCase();
    return availableAgents.filter(agent => 
      agent.displayName.toLowerCase().includes(query) ||
      agent.key.toLowerCase().includes(query) ||
      agent.role.toLowerCase().includes(query)
    );
  }, [availableAgents, searchQuery]);

  const handleAddAgent = async () => {
    if (!selectedAgentId) return;
    
    setIsAddingAgent(true);
    try {
      const response = await fetch(`/api/groups/${group.id}/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: selectedAgentId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add agent to group');
      }

      toast.success('Agent added to group successfully!');
      setSelectedAgentId('');
      setSearchQuery('');
      
      // Refresh data
      mutate(`/api/groups/${group.id}/agents`);
      mutate('/api/groups');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add agent to group');
    } finally {
      setIsAddingAgent(false);
    }
  };

  const handleRemoveAgent = async (agentId: string) => {
    try {
      const response = await fetch(`/api/groups/${group.id}/agents/${agentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove agent from group');
      }

      toast.success('Agent removed from group successfully!');
      
      // Refresh data
      mutate(`/api/groups/${group.id}/agents`);
      mutate('/api/groups');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove agent from group');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Manage Group: {group.displayName}</h2>
          <p className="text-muted-foreground">@{group.key}</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          <X size={16} />
          Close
        </Button>
      </div>

      {/* Current Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} />
            Group Members ({groupAgents.length})
          </CardTitle>
          <CardDescription>
            Agents currently in this group
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">❌</div>
              <h3 className="text-lg font-semibold mb-2 text-red-600">Failed to load group members</h3>
              <p className="text-muted-foreground mb-4">
                {error.message || 'An error occurred while loading group members'}
              </p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : isLoadingGroupAgents ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading group members...</p>
            </div>
          ) : groupAgents.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-semibold mb-2">No agents in group</h3>
              <p className="text-muted-foreground mb-4">
                Hãy thêm agent vào nhóm để bắt đầu
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {groupAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback 
                        className="text-xs"
                        style={{ backgroundColor: agent.color || '#3B82F6' }}
                      >
                        {agent.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{agent.displayName}</div>
                      <div className="text-sm text-muted-foreground">
                        @{agent.key} • {agent.role}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={agent.localEnabled ? "default" : "secondary"}>
                      {agent.localEnabled ? 'Active' : 'Disabled'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveAgent(agent.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X size={14} />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Agent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus size={20} />
            Add Agent to Group
          </CardTitle>
          <CardDescription>
            Search and add agents from your personal directory
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search agents by name, key, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Available Agents List */}
          {searchQuery.trim() && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredAvailableAgents.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No agents found matching "{searchQuery}"
                </div>
              ) : (
                filteredAvailableAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback 
                          className="text-xs"
                          style={{ backgroundColor: agent.color || '#3B82F6' }}
                        >
                          {agent.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{agent.displayName}</div>
                        <div className="text-sm text-muted-foreground">
                          @{agent.key} • {agent.role}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => setSelectedAgentId(agent.id)}
                      disabled={selectedAgentId === agent.id}
                    >
                      <Plus size={14} />
                      Add
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Quick Add Dropdown */}
          {!searchQuery.trim() && availableAgents.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Add:</Label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent to add..." />
                </SelectTrigger>
                <SelectContent>
                  {availableAgents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: agent.color || '#3B82F6' }}
                        />
                        {agent.displayName} (@{agent.key})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* No Available Agents Message */}
          {!searchQuery.trim() && availableAgents.length === 0 && agents.length > 0 && (
            <div className="text-center py-4 text-muted-foreground">
              All your agents are already in this group
            </div>
          )}

          {/* Add Button */}
          {selectedAgentId && (
            <div className="flex items-center gap-2 pt-2">
              <Button
                onClick={handleAddAgent}
                disabled={isAddingAgent}
                className="w-full"
              >
                {isAddingAgent ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Add to Group
                  </>
                )}
              </Button>
            </div>
          )}


          
          {agents.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              You don't have any agents yet. Create some agents first to add them to groups.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}