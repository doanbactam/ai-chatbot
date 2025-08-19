'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from '@/components/toast';
import {
  Settings,
  Monitor,
  Sun,
  Moon,
  Keyboard,
  Users,
  Puzzle,
  BarChart3,
  Bot,
  Mail,
  Key,
  Eye,
  EyeOff,
  Trash2,
  Save,
} from 'lucide-react';

interface SettingsDialogProps {
  children: React.ReactNode;
}

type SettingsTab =
  | 'general'
  | 'api-keys'
  | 'shortcuts'
  | 'settings'
  | 'members'
  | 'plugins'
  | 'usage'
  | 'background-agents'
  | 'contact';

const settingsTabs = [
  { id: 'general' as const, label: 'General', icon: Settings },
  { id: 'api-keys' as const, label: 'API Keys', icon: Key },
  { id: 'shortcuts' as const, label: 'Shortcuts', icon: Keyboard },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
  { id: 'members' as const, label: 'Members', icon: Users },
  { id: 'plugins' as const, label: 'Plugins', icon: Puzzle },
  { id: 'usage' as const, label: 'Usage', icon: BarChart3 },
  { id: 'background-agents' as const, label: 'Background Agents', icon: Bot },
  { id: 'contact' as const, label: 'Contact Us', icon: Mail },
];

interface ApiKeyData {
  configured: boolean;
  masked: string | null;
}

interface ApiKeysState {
  [provider: string]: ApiKeyData;
}

const providers = [
  { id: 'openai', name: 'OpenAI', icon: '⚡', placeholder: 'sk-...' },
  { id: 'anthropic', name: 'Anthropic', icon: '🔮', placeholder: 'sk-ant-...' },
  { id: 'google', name: 'Google', icon: '🔍', placeholder: 'AI...' },
  { id: 'mistral', name: 'Mistral', icon: '🌪️', placeholder: 'mi-...' },
  { id: 'cohere', name: 'Cohere', icon: '🎯', placeholder: 'co-...' },
  { id: 'xai', name: 'XAI', icon: '🤖', placeholder: 'xai-...' },
];

export function SettingsDialog({ children }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [defaultGrouping, setDefaultGrouping] = useState('merge');

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKeysState>({});
  const [apiKeyInputs, setApiKeyInputs] = useState<Record<string, string>>({});
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load API keys when dialog opens
  useEffect(() => {
    if (open && activeTab === 'api-keys') {
      loadApiKeys();
    }
  }, [open, activeTab]);

  const loadApiKeys = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/settings/api-keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.apiKeys || {});
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast({
        type: 'error',
        description: 'Failed to load API keys',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveApiKeys = async () => {
    try {
      setIsLoading(true);
      const apiKeysToSave = Object.entries(apiKeyInputs)
        .filter(([_, key]) => key.trim())
        .map(([provider, apiKey]) => ({ provider, apiKey }));

      const response = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKeys: apiKeysToSave }),
      });

      if (response.ok) {
        toast({
          type: 'success',
          description: 'API keys saved successfully',
        });
        setApiKeyInputs({});
        await loadApiKeys();
      } else {
        throw new Error('Failed to save API keys');
      }
    } catch (error) {
      console.error('Error saving API keys:', error);
      toast({
        type: 'error',
        description: 'Failed to save API keys',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeApiKey = async (provider: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/settings/api-keys?provider=${provider}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          type: 'success',
          description: `${provider} API key removed`,
        });
        await loadApiKeys();
      } else {
        throw new Error('Failed to remove API key');
      }
    } catch (error) {
      console.error('Error removing API key:', error);
      toast({
        type: 'error',
        description: 'Failed to remove API key',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-1">General</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Configure default UI display, grouping, and expansion behaviors.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-3 block">UI Display Style</label>
          <p className="text-xs text-muted-foreground mb-3">
            Choose how to display the theme in all views.
          </p>
          <div className="flex gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('light')}
              className="flex items-center gap-2"
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('dark')}
              className="flex items-center gap-2"
            >
              <Moon className="h-4 w-4" />
              Dark
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-3 block">Default Grouping</label>
          <p className="text-xs text-muted-foreground mb-3">
            Initial grouping for new background agents list.
          </p>
          <Select value={defaultGrouping} onValueChange={setDefaultGrouping}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="merge">Merge</SelectItem>
              <SelectItem value="separate">Separate</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderApiKeysSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-1">API Keys</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Configure API keys for different AI providers to enable their models.
        </p>
      </div>

      <div className="h-[450px] overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-3 pr-4">
            {providers.map((provider) => {
            const isConfigured = apiKeys[provider.id]?.configured;
            const maskedKey = apiKeys[provider.id]?.masked;
            const inputValue = apiKeyInputs[provider.id] || '';
            const showKey = showApiKeys[provider.id];

            return (
              <div key={provider.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{provider.icon}</span>
                    <div>
                      <h4 className="font-medium text-sm">{provider.name}</h4>
                      {isConfigured && (
                        <p className="text-xs text-muted-foreground">
                          {maskedKey}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isConfigured && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeApiKey(provider.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <div className={`w-2 h-2 rounded-full ${
                      isConfigured ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`${provider.id}-key`} className="text-xs">
                    API Key {!isConfigured && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id={`${provider.id}-key`}
                        type={showKey ? 'text' : 'password'}
                        placeholder={provider.placeholder}
                        value={inputValue}
                        onChange={(e) => setApiKeyInputs(prev => ({
                          ...prev,
                          [provider.id]: e.target.value
                        }))}
                        disabled={isLoading}
                        className="h-8 text-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-8 px-2"
                        onClick={() => setShowApiKeys(prev => ({
                          ...prev,
                          [provider.id]: !prev[provider.id]
                        }))}
                      >
                        {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </ScrollArea>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          onClick={saveApiKeys}
          disabled={isLoading || Object.keys(apiKeyInputs).length === 0}
        >
          <Save className="h-4 w-4 mr-2" />
          Save API Keys
        </Button>
      </div>

      <div className="mt-4 p-3 bg-muted rounded-lg">
        <h4 className="font-medium mb-2 text-sm">How to get API Keys</h4>
        <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
          <p><strong>OpenAI:</strong> platform.openai.com</p>
          <p><strong>Anthropic:</strong> console.anthropic.com</p>
          <p><strong>Google:</strong> aistudio.google.com</p>
          <p><strong>Mistral:</strong> console.mistral.ai</p>
          <p><strong>Cohere:</strong> cohere.ai</p>
          <p><strong>XAI:</strong> x.ai</p>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'api-keys':
        return renderApiKeysSettings();
      case 'shortcuts':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Keyboard Shortcuts</h3>
            <p className="text-sm text-muted-foreground">
              Customize keyboard shortcuts for faster navigation.
            </p>
            <div className="text-sm text-muted-foreground">
              Coming soon...
            </div>
          </div>
        );
      case 'members':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Team Members</h3>
            <p className="text-sm text-muted-foreground">
              Manage team members and their permissions.
            </p>
            <div className="text-sm text-muted-foreground">
              Coming soon...
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {settingsTabs.find(tab => tab.id === activeTab)?.label}
            </h3>
            <div className="text-sm text-muted-foreground">
              This section is under development.
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="flex h-full min-h-[600px]">
          {/* Sidebar */}
          <div className="w-64 bg-muted/30 border-r">
            <ScrollArea className="h-full p-4">
              <div className="space-y-1">
                {settingsTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left',
                        activeTab === tab.id
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <ScrollArea className="h-full">
              <div className="p-6">
                {renderTabContent()}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
