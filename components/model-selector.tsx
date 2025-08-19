'use client';

import { startTransition, useMemo, useOptimistic, useState } from 'react';

import { saveChatModelAsCookie } from '@/app/(chat)/actions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { chatModels, getAutoSelectedModel, type AutoSelectionStrategy } from '@/lib/ai/models';
import { cn } from '@/lib/utils';

import { CheckCircleFillIcon, ChevronDownIcon, InvoiceIcon } from './icons';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import type { Session } from 'next-auth';

// Provider icons mapping
const providerIcons: Record<string, string> = {
  xai: '🤖',
  openai: '⚡',
  anthropic: '🔮',
  google: '🔍',
  mistral: '🌪️',
  cohere: '🎯',
};

// Capability icons mapping
const capabilityIcons: Record<string, string> = {
  text: '📝',
  vision: '👁️',
  reasoning: '🧠',
  code: '💻',
};

// Performance icons mapping
const performanceIcons: Record<string, string> = {
  fast: '⚡',
  medium: '🔄',
  slow: '🐌',
};

// Quality icons mapping
const qualityIcons: Record<string, string> = {
  high: '⭐',
  medium: '⭐',
  low: '⭐',
};

// Auto selection strategy icons
const strategyIcons: Record<AutoSelectionStrategy, string> = {
  'cost-efficient': '💰',
  'speed-optimized': '⚡',
  'quality-optimized': '⭐',
  'balanced': '⚖️',
};

// Auto selection strategy descriptions
const strategyDescriptions: Record<AutoSelectionStrategy, string> = {
  'cost-efficient': 'Best value for money',
  'speed-optimized': 'Fastest response time',
  'quality-optimized': 'Highest quality output',
  'balanced': 'Good balance of all factors',
};

export function ModelSelector({
  session,
  selectedModelId,
  className,
}: {
  session: Session;
  selectedModelId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);

  const userType = session.user.type;
  const { availableChatModelIds } = entitlementsByUserType[userType];

  const availableChatModels = chatModels.filter((chatModel) =>
    availableChatModelIds.includes(chatModel.id),
  );

  const selectedChatModel = useMemo(
    () =>
      availableChatModels.find(
        (chatModel) => chatModel.id === optimisticModelId,
      ),
    [optimisticModelId, availableChatModels],
  );

  const handleAutoSelection = (strategy: AutoSelectionStrategy) => {
    const autoModelId = getAutoSelectedModel(strategy, availableChatModelIds);
    setOpen(false);
    startTransition(() => {
      setOptimisticModelId(autoModelId);
      saveChatModelAsCookie(autoModelId);
    });
  };

  const formatPrice = (price: number) => {
    if (price < 0.001) return `$${(price * 1000).toFixed(2)}/1M tokens`;
    if (price < 0.01) return `$${(price * 100).toFixed(2)}/100K tokens`;
    return `$${price.toFixed(3)}/1K tokens`;
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button
          data-testid="model-selector"
          variant="outline"
          className="md:px-2 md:h-[34px]"
        >
          {selectedChatModel?.name}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[400px]">
        {/* Auto Selection Section */}
        <div className="p-2 border-b">
          <div className="text-xs font-medium text-muted-foreground mb-2">Auto Selection</div>
          <div className="grid grid-cols-2 gap-2">
            {(['cost-efficient', 'speed-optimized', 'quality-optimized', 'balanced'] as AutoSelectionStrategy[]).map((strategy) => (
              <button
                key={strategy}
                type="button"
                className="flex items-center gap-2 p-2 text-xs rounded-md hover:bg-accent transition-colors text-left"
                onClick={() => handleAutoSelection(strategy)}
              >
                <span className="text-lg">{strategyIcons[strategy]}</span>
                <div>
                  <div className="font-medium capitalize">{strategy.replace('-', ' ')}</div>
                  <div className="text-muted-foreground">{strategyDescriptions[strategy]}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Model Selection */}
        <div className="p-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">Manual Selection</div>
          {availableChatModels.map((chatModel) => {
            const { id, provider, capabilities, pricing, performance } = chatModel;

            return (
              <DropdownMenuItem
                data-testid={`model-selector-item-${id}`}
                key={id}
                onSelect={() => {
                  setOpen(false);

                  startTransition(() => {
                    setOptimisticModelId(id);
                    saveChatModelAsCookie(id);
                  });
                }}
                data-active={id === optimisticModelId}
                asChild
              >
                <button
                  type="button"
                  className="gap-4 group/item flex flex-row justify-between items-center w-full"
                >
                  <div className="flex flex-col gap-1 items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{providerIcons[provider] || '🤖'}</span>
                      <span className="font-medium">{chatModel.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {chatModel.description}
                    </div>
                    
                    {/* Capabilities */}
                    <div className="flex items-center gap-1 mt-1">
                      {capabilities.map((capability) => (
                        <span
                          key={capability}
                          className="text-xs bg-muted px-2 py-1 rounded-md flex items-center gap-1"
                          title={capability}
                        >
                          {capabilityIcons[capability] || '✨'}
                          {capability}
                        </span>
                      ))}
                    </div>

                    {/* Performance & Pricing */}
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <div className="flex items-center gap-1">
                        <span>{performanceIcons[performance.speed]}</span>
                        <span className="text-muted-foreground">{performance.speed}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{qualityIcons[performance.quality]}</span>
                        <span className="text-muted-foreground">{performance.quality}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <InvoiceIcon size={12} />
                        <span className="text-muted-foreground">
                          {formatPrice(pricing.inputPer1kTokens + pricing.outputPer1kTokens)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                    <CheckCircleFillIcon />
                  </div>
                </button>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
