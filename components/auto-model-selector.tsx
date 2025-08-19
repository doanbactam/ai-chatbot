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
import { chatModels, getAutoSelectedModel, type AutoSelectionStrategy } from '@/lib/ai/models';
import { ModelInfo } from './model-info';

interface AutoModelSelectorProps {
  onModelSelect: (modelId: string) => void;
  availableModels?: string[];
  trigger?: React.ReactNode;
  className?: string;
}

// Auto selection strategies
const AUTO_SELECTION_STRATEGIES: Array<{
  id: AutoSelectionStrategy;
  name: string;
  description: string;
  icon: string;
  color: string;
}> = [
  {
    id: 'cost-efficient',
    name: 'Cost Efficient',
    description: 'Best value for money - lowest cost per token',
    icon: '💰',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  {
    id: 'speed-optimized',
    name: 'Speed Optimized',
    description: 'Fastest response time - lowest latency',
    icon: '⚡',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  {
    id: 'quality-optimized',
    name: 'Quality Optimized',
    description: 'Highest quality output - best reasoning',
    icon: '⭐',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Good balance of cost, speed, and quality',
    icon: '⚖️',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
];

export function AutoModelSelector({ 
  onModelSelect, 
  availableModels = [], 
  trigger,
  className 
}: AutoModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<AutoSelectionStrategy | null>(null);
  const [autoSelectedModel, setAutoSelectedModel] = useState<string | null>(null);

  const handleStrategySelect = (strategy: AutoSelectionStrategy) => {
    setSelectedStrategy(strategy);
    const modelId = getAutoSelectedModel(strategy, availableModels);
    setAutoSelectedModel(modelId);
  };

  const handleConfirm = () => {
    if (autoSelectedModel) {
      onModelSelect(autoSelectedModel);
      setIsOpen(false);
      setSelectedStrategy(null);
      setAutoSelectedModel(null);
    }
  };

  const getAvailableModelsCount = () => {
    return availableModels.length > 0 ? availableModels.length : chatModels.length;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className={className}>
            🎯 Auto Select Model
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Auto Model Selection</DialogTitle>
          <DialogDescription>
            Choose a strategy and let AI automatically select the best model for your needs.
            {availableModels.length > 0 && ` Available models: ${getAvailableModelsCount()}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Strategy Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Strategy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AUTO_SELECTION_STRATEGIES.map((strategy) => (
                <button
                  key={strategy.id}
                  type="button"
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedStrategy === strategy.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-accent/50'
                  }`}
                  onClick={() => handleStrategySelect(strategy.id)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{strategy.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{strategy.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {strategy.description}
                      </div>
                      <Badge className={`mt-2 ${strategy.color}`}>
                        {strategy.id.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Auto Selected Model Preview */}
          {selectedStrategy && autoSelectedModel && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Selected Model: {selectedStrategy.replace('-', ' ')} Strategy
              </h3>
              <ModelInfo modelId={autoSelectedModel} />
              
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Why this model?</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  {selectedStrategy === 'cost-efficient' && (
                    <>
                      <p>• Lowest cost per token for input and output</p>
                      <p>• Good balance of performance and affordability</p>
                      <p>• Ideal for high-volume, cost-conscious applications</p>
                    </>
                  )}
                  {selectedStrategy === 'speed-optimized' && (
                    <>
                      <p>• Fastest response time and lowest latency</p>
                      <p>• Optimized for real-time interactions</p>
                      <p>• Great for chat applications and quick responses</p>
                    </>
                  )}
                  {selectedStrategy === 'quality-optimized' && (
                    <>
                      <p>• Highest quality output and reasoning capabilities</p>
                      <p>• Best for complex tasks and analysis</p>
                      <p>• Suitable for professional and critical applications</p>
                    </>
                  )}
                  {selectedStrategy === 'balanced' && (
                    <>
                      <p>• Good balance of cost, speed, and quality</p>
                      <p>• Versatile for most use cases</p>
                      <p>• Recommended for general applications</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!autoSelectedModel}
            >
              Use Selected Model
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}