'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { chatModels, } from '@/lib/ai/models';

interface ModelInfoProps {
  modelId: string;
  className?: string;
}

export function ModelInfo({ modelId, className }: ModelInfoProps) {
  const model = chatModels.find(m => m.id === modelId);
  
  if (!model) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <p className="text-muted-foreground">Model not found</p>
        </CardContent>
      </Card>
    );
  }

  const { pricing, performance, capabilities, provider } = model;

  const formatPrice = (price: number) => {
    if (price < 0.001) return `$${(price * 1000).toFixed(2)}/1M tokens`;
    if (price < 0.01) return `$${(price * 100).toFixed(2)}/100K tokens`;
    return `$${price.toFixed(3)}/1K tokens`;
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
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-2xl">{getProviderIcon(provider)}</span>
          {model.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{model.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Capabilities */}
        <div>
          <h4 className="text-sm font-medium mb-2">Capabilities</h4>
          <div className="flex flex-wrap gap-2">
            {capabilities.map((capability) => (
              <Badge key={capability} variant="secondary" className="text-xs">
                {capability}
              </Badge>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <h4 className="text-sm font-medium mb-2">Performance</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <Badge className={getPerformanceColor(performance.speed)}>
                {performance.speed === 'fast' ? '⚡' : performance.speed === 'medium' ? '🔄' : '🐌'}
                {performance.speed}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Speed</p>
            </div>
            <div className="text-center">
              <Badge className={getQualityColor(performance.quality)}>
                {performance.quality === 'high' ? '⭐' : performance.quality === 'medium' ? '⭐' : '⭐'}
                {performance.quality}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Quality</p>
            </div>
            <div className="text-center">
              <Badge variant="outline">
                {performance.latency}ms
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Latency</p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div>
          <h4 className="text-sm font-medium mb-2">Pricing</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <Badge variant="outline" className="text-xs">
                {formatPrice(pricing.inputPer1kTokens)}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Input</p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="text-xs">
                {formatPrice(pricing.outputPer1kTokens)}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Output</p>
            </div>
          </div>
        </div>

        {/* Auto Selection Tags */}
        <div>
          <h4 className="text-sm font-medium mb-2">Auto Selection</h4>
          <div className="flex flex-wrap gap-2">
            {model.autoSelection.costEfficient && (
              <Badge variant="secondary" className="text-xs">
                💰 Cost Efficient
              </Badge>
            )}
            {model.autoSelection.speedOptimized && (
              <Badge variant="secondary" className="text-xs">
                ⚡ Speed Optimized
              </Badge>
            )}
            {model.autoSelection.qualityOptimized && (
              <Badge variant="secondary" className="text-xs">
                ⭐ Quality Optimized
              </Badge>
            )}
            {model.autoSelection.balanced && (
              <Badge variant="secondary" className="text-xs">
                ⚖️ Balanced
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}