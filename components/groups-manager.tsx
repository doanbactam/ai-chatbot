'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import useSWR, { mutate } from 'swr';
import type { Session } from 'next-auth';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PlusIcon } from './icons';
import { fetcher } from '@/lib/utils';
import type { AiGroup, AiAgent } from '@/lib/db/schema';
import { AgentsManager } from './agents-manager';

interface GroupsManagerProps {
  session: Session;
}

export function GroupsManager({ session }: GroupsManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<AiGroup | null>(null);
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  const { data: groupsData, error: groupsError, isLoading: groupsLoading } = useSWR<{ groups: AiGroup[] }>(
    '/api/groups',
    fetcher
  );

  const { data: agentsData } = useSWR<{ agents: AiAgent[] }>(
    '/api/agents',
    fetcher
  );

  const groups = groupsData?.groups || [];
  const agents = agentsData?.agents || [];

  const handleCreateGroup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreateLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      key: formData.get('key') as string,
      displayName: formData.get('displayName') as string,
      description: formData.get('description') as string,
    };

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create group');
      }

      toast.success('Group created successfully!');
      setIsCreateDialogOpen(false);
      mutate('/api/groups');
      
      // Reset form
      event.currentTarget.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create group');
    } finally {
      setIsCreateLoading(false);
    }
  };

  if (groupsError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load groups. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Groups Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Your Groups</h2>
            <p className="text-muted-foreground">Organize agents into collaborative groups</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon size={16} />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <Label htmlFor="key">Key</Label>
                  <Input
                    id="key"
                    name="key"
                    placeholder="e.g., marketing-team"
                    pattern="^[a-zA-Z0-9_-]+$"
                    title="Only letters, numbers, underscore and dash allowed"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Unique identifier (letters, numbers, underscore, dash only)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    placeholder="e.g., Marketing Team"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the purpose of this group..."
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreateLoading}>
                    {isCreateLoading ? 'Creating...' : 'Create Group'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {groupsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first group to start organizing AI agents
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <Card key={group.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: '#3B82F6' }}
                    />
                    {group.displayName}
                  </CardTitle>
                  <CardDescription>@{group.key}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {group.description || 'No description'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {group.isEnabled ? 'Active' : 'Disabled'}
                    </Badge>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedGroup(group)}
                    >
                      ⚙️
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Agents Section */}
      <AgentsManager session={session} agents={agents} groups={groups} />

      {/* Group Details Dialog */}
      {selectedGroup && (
        <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Manage Group: {selectedGroup.displayName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Group Details</h4>
                <div className="bg-muted p-4 rounded-md">
                  <p><strong>Key:</strong> {selectedGroup.key}</p>
                  <p><strong>Description:</strong> {selectedGroup.description || 'No description'}</p>
                  <p><strong>Status:</strong> {selectedGroup.isEnabled ? 'Active' : 'Disabled'}</p>
                  <p><strong>Created:</strong> {new Date(selectedGroup.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              {/* TODO: Add agents management for this specific group */}
              <div>
                <h4 className="font-semibold mb-2">Group Agents</h4>
                <p className="text-muted-foreground">
                  Agent management for specific groups will be implemented here.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}