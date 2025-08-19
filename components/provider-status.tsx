'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { chatModels } from '@/lib/ai/models';
import { validateProviderConfig } from '@/lib/ai/provider-config';

interface ProviderStatus {
  name: string;
  icon: string;
  models: Array<{
    id: string;
    name: string;
    status: 'available' | 'unavailable' | 'error';
    capabilities: string[];
  }>;
  apiKeyStatus: 'configured' | 'missing' | 'error';
}

const providerIcons: Record<string, string> = {
  xai: '🤖',
  openai: '⚡',
  anthropic: '🔮',
  google: '🔍',
  mistral: '🌪️',
  cohere: '🎯',
};

const providerNames: Record<string, string> = {
  xai: 'XAI (xAI)',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  mistral: 'Mistral',
  cohere: 'Cohere',
};

export function ProviderStatus() {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProviderStatus = async () => {
      try {
        const configValidation = validateProviderConfig();
        const providerConfigs = configValidation.missingKeys;
        
        const providersList: ProviderStatus[] = [];
        
        // Group models by provider
        const modelsByProvider = chatModels.reduce((acc, model) => {
          if (!acc[model.provider]) {
            acc[model.provider] = [];
          }
          acc[model.provider].push(model);
          return acc;
        }, {} as Record<string, typeof chatModels>);

        // Create provider status for each provider
        Object.entries(modelsByProvider).forEach(([provider, models]) => {
          const isApiKeyMissing = providerConfigs.includes(`${provider.toUpperCase()}_API_KEY`);
          
          providersList.push({
            name: providerNames[provider] || provider,
            icon: providerIcons[provider] || '🤖',
            models: models.map(model => ({
              id: model.id,
              name: model.name,
              status: isApiKeyMissing ? 'unavailable' : 'available',
              capabilities: model.capabilities,
            })),
            apiKeyStatus: isApiKeyMissing ? 'missing' : 'configured',
          });
        });

        setProviders(providersList);
      } catch (error) {
        console.error('Error loading provider status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProviderStatus();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'unavailable':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'error':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getApiKeyStatusColor = (status: string) => {
    switch (status) {
      case 'configured':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'missing':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'error':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Loading Providers...
          </Button>
        </DialogTrigger>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full size-8 border-b-2 border-gray-900" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          AI Providers Status
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Providers Status</DialogTitle>
          <DialogDescription>
            Check the status and configuration of all AI providers
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {providers.map((provider) => (
            <div key={provider.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{provider.icon}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{provider.name}</h3>
                    <Badge 
                      variant="secondary" 
                      className={getApiKeyStatusColor(provider.apiKeyStatus)}
                    >
                      {provider.apiKeyStatus === 'configured' ? '✅ Configured' : '❌ API Key Missing'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {provider.models.map((model) => (
                  <div key={model.id} className="border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{model.name}</h4>
                      <Badge 
                        variant="secondary" 
                        className={getStatusColor(model.status)}
                      >
                        {model.status === 'available' ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {model.capabilities.map((capability) => (
                        <Badge key={capability} variant="outline" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Configuration Instructions</h4>
          <p className="text-sm text-muted-foreground mb-3">
            To use AI providers, add the following environment variables to your .env file:
          </p>
          <div className="space-y-2 text-sm font-mono bg-background p-3 rounded">
            <div>OPENAI_API_KEY=your_openai_key</div>
            <div>ANTHROPIC_API_KEY=your_anthropic_key</div>
            <div>GOOGLE_API_KEY=your_google_key</div>
            <div>MISTRAL_API_KEY=your_mistral_key</div>
            <div>COHERE_API_KEY=your_cohere_key</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}