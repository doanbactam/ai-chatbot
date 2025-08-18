'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusIcon } from './icons';
import type { AiGroup, AiAgent } from '@/lib/db/schema';

interface AgentsManagerProps {
  session: Session;
  agents: AiAgent[];
  groups: AiGroup[];
}

const AVAILABLE_MODELS = [
  { id: 'chat-model', name: 'Standard Model' },
  { id: 'chat-model-reasoning', name: 'Reasoning Model' },
];

const AGENT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];

export function AgentsManager({ session, agents, groups }: AgentsManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  const handleCreateAgent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreateLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      key: formData.get('key') as string,
      displayName: formData.get('displayName') as string,
      role: formData.get('role') as string,
      model: formData.get('model') as string,
      systemPrompt: formData.get('systemPrompt') as string,
      color: formData.get('color') as string,
      maxTokens: formData.get('maxTokens') as string,
      temperature: formData.get('temperature') as string,
    };

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create agent');
      }

      toast.success('Agent created successfully!');
      setIsCreateDialogOpen(false);
      mutate('/api/agents');
      
      // Reset form
      event.currentTarget.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create agent');
    } finally {
      setIsCreateLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Your Agents</h2>
          <p className="text-muted-foreground">Create and manage individual AI agents</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon size={16} />
              Create Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Agent</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agent-key">Key</Label>
                  <Input
                    id="agent-key"
                    name="key"
                    placeholder="e.g., content-writer"
                    pattern="^[a-zA-Z0-9_-]+$"
                    title="Only letters, numbers, underscore and dash allowed"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Used for @mentions
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="agent-displayName">Display Name</Label>
                  <Input
                    id="agent-displayName"
                    name="displayName"
                    placeholder="e.g., Content Writer"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agent-role">Role</Label>
                  <Input
                    id="agent-role"
                    name="role"
                    placeholder="e.g., assistant, expert, analyst"
                    defaultValue="assistant"
                  />
                </div>
                
                <div>
                  <Label htmlFor="agent-model">Model</Label>
                  <Select name="model" defaultValue="chat-model">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="agent-systemPrompt">System Prompt</Label>
                <Textarea
                  id="agent-systemPrompt"
                  name="systemPrompt"
                  placeholder="Define the agent's personality, expertise, and behavior..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to use default system prompt
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="agent-color">Color</Label>
                  <Select name="color" defaultValue="#3B82F6">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AGENT_COLORS.map((color) => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: color }}
                            />
                            {color}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="agent-maxTokens">Max Tokens</Label>
                  <Input
                    id="agent-maxTokens"
                    name="maxTokens"
                    type="number"
                    placeholder="2000"
                    defaultValue="2000"
                    min="100"
                    max="8000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="agent-temperature">Temperature</Label>
                  <Input
                    id="agent-temperature"
                    name="temperature"
                    type="number"
                    placeholder="0.7"
                    defaultValue="0.7"
                    min="0"
                    max="2"
                    step="0.1"
                  />
                </div>
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
                  {isCreateLoading ? 'Creating...' : 'Create Agent'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {agents.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first AI agent to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: agent.color || '#3B82F6' }}
                  />
                  {agent.displayName}
                </CardTitle>
                <CardDescription>@{agent.key}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Role:</span>
                    <span>{agent.role}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Model:</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {agent.model}
                    </span>
                  </div>
                  
                  {agent.systemPrompt && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Prompt:</span>
                      <p className="text-xs mt-1 line-clamp-2 text-muted-foreground">
                        {agent.systemPrompt}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2">
                    <Badge variant={agent.isEnabled ? "default" : "secondary"}>
                      {agent.isEnabled ? 'Active' : 'Disabled'}
                    </Badge>
                    
                    <div className="text-xs text-muted-foreground">
                      {agent.maxTokens} tokens, temp: {agent.temperature}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}