'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { chatModels, } from '@/lib/ai/models';

interface ModelComparisonProps {
  trigger?: React.ReactNode;
  className?: string;
  onModelSelect?: (modelId: string) => void;
}

export function ModelComparison({ trigger, className, onModelSelect }: ModelComparisonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'cost' | 'speed' | 'quality'>('name');
  const [filterProvider, setFilterProvider] = useState<string>('all');

  const filteredModels = chatModels.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = filterProvider === 'all' || model.provider === filterProvider;
    return matchesSearch && matchesProvider;
  });

  const sortedModels = [...filteredModels].sort((a, b) => {
    switch (sortBy) {
      case 'cost': {
        const aCost = a.pricing.inputPer1kTokens + a.pricing.outputPer1kTokens;
        const bCost = b.pricing.inputPer1kTokens + b.pricing.outputPer1kTokens;
        return aCost - bCost;
      }
      case 'speed':
        return a.performance.latency - b.performance.latency;
      case 'quality': {
        const qualityOrder = { high: 3, medium: 2, low: 1 };
        return qualityOrder[b.performance.quality] - qualityOrder[a.performance.quality];
      }
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const providers = Array.from(new Set(chatModels.map(m => m.provider)));

  const formatPrice = (price: number) => {
    if (price < 0.001) return `$${(price * 1000).toFixed(2)}/1M`;
    if (price < 0.01) return `$${(price * 100).toFixed(2)}/100K`;
    return `$${price.toFixed(3)}/1K`;
  };

  const getPerformanceColor = (speed: string) => {
    switch (speed) {
      case 'fast': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'slow': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'high': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getProviderIcon = (provider: string) => {
    const icons: Record<string, string> = {
      xai: '🤖',
      openai: '⚡',
      anthropic: '🔮',
      google: '🔍',
      mistral: '🌪️',
      cohere: '🎯',
    };
    return icons[provider] || '🤖';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className={className}>
            📊 Compare Models
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Model Comparison</DialogTitle>
          <DialogDescription>
            Compare AI models across different providers, performance metrics, and pricing.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Models</Label>
              <Input
                id="search"
                placeholder="Search by name or provider..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="provider-filter">Provider</Label>
              <select
                id="provider-filter"
                className="w-full px-3 py-2 border rounded-md"
                value={filterProvider}
                onChange={(e) => setFilterProvider(e.target.value)}
              >
                <option value="all">All Providers</option>
                {providers.map(provider => (
                  <option key={provider} value={provider}>
                    {getProviderIcon(provider)} {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="sort-by">Sort By</Label>
              <select
                id="sort-by"
                className="w-full px-3 py-2 border rounded-md"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="name">Name</option>
                <option value="cost">Cost</option>
                <option value="speed">Speed</option>
                <option value="quality">Quality</option>
              </select>
            </div>
          </div>

          {/* Models Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted p-4 grid grid-cols-12 gap-4 font-medium text-sm">
              <div className="col-span-3">Model</div>
              <div className="col-span-2">Provider</div>
              <div className="col-span-2">Performance</div>
              <div className="col-span-2">Pricing</div>
              <div className="col-span-2">Capabilities</div>
              <div className="col-span-1">Actions</div>
            </div>
            
            <div className="divide-y">
              {sortedModels.map((model) => (
                <div key={model.id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-muted/50">
                  {/* Model Name */}
                  <div className="col-span-3">
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {model.description}
                    </div>
                  </div>
                  
                  {/* Provider */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getProviderIcon(model.provider)}</span>
                      <span className="capitalize">{model.provider}</span>
                    </div>
                  </div>
                  
                  {/* Performance */}
                  <div className="col-span-2">
                    <div className="space-y-1">
                      <Badge className={getPerformanceColor(model.performance.speed)}>
                        {model.performance.speed === 'fast' ? '⚡' : model.performance.speed === 'medium' ? '🔄' : '🐌'}
                        {model.performance.speed}
                      </Badge>
                      <Badge className={getQualityColor(model.performance.quality)}>
                        {model.performance.quality === 'high' ? '⭐' : model.performance.quality === 'medium' ? '⭐' : '⭐'}
                        {model.performance.quality}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {model.performance.latency}ms
                      </div>
                    </div>
                  </div>
                  
                  {/* Pricing */}
                  <div className="col-span-2">
                    <div className="space-y-1 text-sm">
                      <div>Input: {formatPrice(model.pricing.inputPer1kTokens)}</div>
                      <div>Output: {formatPrice(model.pricing.outputPer1kTokens)}</div>
                      <div className="font-medium">
                        Total: {formatPrice(model.pricing.inputPer1kTokens + model.pricing.outputPer1kTokens)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Capabilities */}
                  <div className="col-span-2">
                    <div className="flex flex-wrap gap-1">
                      {model.capabilities.map((capability) => (
                        <Badge key={capability} variant="outline" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="col-span-1">
                    {onModelSelect && (
                      <Button
                        size="sm"
                        onClick={() => {
                          onModelSelect(model.id);
                          setIsOpen(false);
                        }}
                      >
                        Select
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">{sortedModels.length}</div>
              <div className="text-sm text-muted-foreground">Total Models</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{providers.length}</div>
              <div className="text-sm text-muted-foreground">Providers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                ${Math.min(...sortedModels.map(m => m.pricing.inputPer1kTokens + m.pricing.outputPer1kTokens)).toFixed(4)}
              </div>
              <div className="text-sm text-muted-foreground">Lowest Cost/1K</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.min(...sortedModels.map(m => m.performance.latency))}ms
              </div>
              <div className="text-sm text-muted-foreground">Fastest Response</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}