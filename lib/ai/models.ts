export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  model: string;
  capabilities: string[];
  pricing: {
    inputPer1kTokens: number;  // USD per 1K input tokens
    outputPer1kTokens: number; // USD per 1K output tokens
  };
  performance: {
    speed: 'fast' | 'medium' | 'slow';  // Response speed
    quality: 'high' | 'medium' | 'low'; // Output quality
    latency: number; // Estimated latency in ms
  };
  autoSelection: {
    costEfficient: boolean;  // Good for cost-conscious use
    speedOptimized: boolean; // Good for fast responses
    qualityOptimized: boolean; // Good for high-quality output
    balanced: boolean;        // Good balance of all factors
  };
}

export const chatModels: Array<ChatModel> = [
  // XAI Models (existing)
  {
    id: 'chat-model',
    name: 'Grok-2 Vision',
    description: 'Primary model for all-purpose chat with vision capabilities',
    provider: 'xai',
    model: 'grok-2-vision-1212',
    capabilities: ['text', 'vision', 'reasoning'],
    pricing: {
      inputPer1kTokens: 0.002,
      outputPer1kTokens: 0.008,
    },
    performance: {
      speed: 'medium',
      quality: 'high',
      latency: 1200,
    },
    autoSelection: {
      costEfficient: false,
      speedOptimized: false,
      qualityOptimized: true,
      balanced: true,
    },
  },
  {
    id: 'chat-model-reasoning',
    name: 'Grok-3 Mini Beta',
    description: 'Uses advanced reasoning capabilities',
    provider: 'xai',
    model: 'grok-3-mini-beta',
    capabilities: ['text', 'reasoning'],
    pricing: {
      inputPer1kTokens: 0.001,
      outputPer1kTokens: 0.004,
    },
    performance: {
      speed: 'fast',
      quality: 'medium',
      latency: 800,
    },
    autoSelection: {
      costEfficient: true,
      speedOptimized: true,
      qualityOptimized: false,
      balanced: true,
    },
  },
  
  // OpenAI Models
  {
    id: 'openai-gpt-4',
    name: 'GPT-4',
    description: 'Most capable GPT model for complex tasks',
    provider: 'openai',
    model: 'gpt-4',
    capabilities: ['text', 'reasoning', 'code'],
    pricing: {
      inputPer1kTokens: 0.03,
      outputPer1kTokens: 0.06,
    },
    performance: {
      speed: 'slow',
      quality: 'high',
      latency: 2000,
    },
    autoSelection: {
      costEfficient: false,
      speedOptimized: false,
      qualityOptimized: true,
      balanced: false,
    },
  },
  {
    id: 'openai-gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient for most tasks',
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    capabilities: ['text', 'code'],
    pricing: {
      inputPer1kTokens: 0.0015,
      outputPer1kTokens: 0.002,
    },
    performance: {
      speed: 'fast',
      quality: 'medium',
      latency: 600,
    },
    autoSelection: {
      costEfficient: true,
      speedOptimized: true,
      qualityOptimized: false,
      balanced: true,
    },
  },
  
  // Anthropic Models
  {
    id: 'anthropic-claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Balanced performance and speed',
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    capabilities: ['text', 'reasoning', 'code'],
    pricing: {
      inputPer1kTokens: 0.003,
      outputPer1kTokens: 0.015,
    },
    performance: {
      speed: 'medium',
      quality: 'high',
      latency: 1000,
    },
    autoSelection: {
      costEfficient: false,
      speedOptimized: false,
      qualityOptimized: true,
      balanced: true,
    },
  },
  {
    id: 'anthropic-claude-3-haiku',
    name: 'Claude 3 Haiku',
    description: 'Fastest Claude model for quick responses',
    provider: 'anthropic',
    model: 'claude-3-haiku-20240307',
    capabilities: ['text', 'code'],
    pricing: {
      inputPer1kTokens: 0.00025,
      outputPer1kTokens: 0.00125,
    },
    performance: {
      speed: 'fast',
      quality: 'medium',
      latency: 400,
    },
    autoSelection: {
      costEfficient: true,
      speedOptimized: true,
      qualityOptimized: false,
      balanced: true,
    },
  },
  
  // Google Models
  {
    id: 'google-gemini-pro',
    name: 'Gemini Pro',
    description: 'Google\'s most capable AI model',
    provider: 'google',
    model: 'gemini-1.5-pro',
    capabilities: ['text', 'reasoning', 'code'],
    pricing: {
      inputPer1kTokens: 0.0025,
      outputPer1kTokens: 0.0075,
    },
    performance: {
      speed: 'medium',
      quality: 'high',
      latency: 900,
    },
    autoSelection: {
      costEfficient: false,
      speedOptimized: false,
      qualityOptimized: true,
      balanced: true,
    },
  },
  
  // Mistral Models
  {
    id: 'mistral-mixtral',
    name: 'Mixtral 8x7B',
    description: 'High-performance open-source model',
    provider: 'mistral',
    model: 'mixtral-8x7b-instruct',
    capabilities: ['text', 'code'],
    pricing: {
      inputPer1kTokens: 0.00014,
      outputPer1kTokens: 0.00042,
    },
    performance: {
      speed: 'fast',
      quality: 'medium',
      latency: 500,
    },
    autoSelection: {
      costEfficient: true,
      speedOptimized: true,
      qualityOptimized: false,
      balanced: true,
    },
  },
  {
    id: 'mistral-7b',
    name: 'Mistral 7B',
    description: 'Efficient and fast open-source model',
    provider: 'mistral',
    model: 'mistral-7b-instruct',
    capabilities: ['text', 'code'],
    pricing: {
      inputPer1kTokens: 0.00007,
      outputPer1kTokens: 0.00021,
    },
    performance: {
      speed: 'fast',
      quality: 'low',
      latency: 300,
    },
    autoSelection: {
      costEfficient: true,
      speedOptimized: true,
      qualityOptimized: false,
      balanced: false,
    },
  },
  
  // Cohere Models
  {
    id: 'cohere-command-r-plus',
    name: 'Command R+',
    description: 'Cohere\'s most advanced model',
    provider: 'cohere',
    model: 'command-r-plus',
    capabilities: ['text', 'reasoning', 'code'],
    pricing: {
      inputPer1kTokens: 0.001,
      outputPer1kTokens: 0.003,
    },
    performance: {
      speed: 'medium',
      quality: 'high',
      latency: 1100,
    },
    autoSelection: {
      costEfficient: true,
      speedOptimized: false,
      qualityOptimized: true,
      balanced: true,
    },
  },
];

// Auto-selection strategies
export type AutoSelectionStrategy = 'cost-efficient' | 'speed-optimized' | 'quality-optimized' | 'balanced';

// Auto-selection logic
export function getAutoSelectedModel(strategy: AutoSelectionStrategy, availableModels: string[] = []): string {
  const models = availableModels.length > 0 
    ? chatModels.filter(m => availableModels.includes(m.id))
    : chatModels;

  switch (strategy) {
    case 'cost-efficient':
      return models
        .filter(m => m.autoSelection.costEfficient)
        .sort((a, b) => (a.pricing.inputPer1kTokens + a.pricing.outputPer1kTokens) - (b.pricing.inputPer1kTokens + b.pricing.outputPer1kTokens))[0]?.id || 'openai-gpt-3.5-turbo';
    
    case 'speed-optimized':
      return models
        .filter(m => m.autoSelection.speedOptimized)
        .sort((a, b) => a.performance.latency - b.performance.latency)[0]?.id || 'mistral-7b';
    
    case 'quality-optimized':
      return models
        .filter(m => m.autoSelection.qualityOptimized)
        .sort((a, b) => {
          if (a.performance.quality === 'high' && b.performance.quality !== 'high') return -1;
          if (b.performance.quality === 'high' && a.performance.quality !== 'high') return 1;
          return a.performance.latency - b.performance.latency;
        })[0]?.id || 'openai-gpt-4';
    
    case 'balanced':
    default:
      return models
        .filter(m => m.autoSelection.balanced)
        .sort((a, b) => {
          const aScore = (a.autoSelection.costEfficient ? 1 : 0) + 
                        (a.autoSelection.speedOptimized ? 1 : 0) + 
                        (a.autoSelection.qualityOptimized ? 1 : 0);
          const bScore = (b.autoSelection.costEfficient ? 1 : 0) + 
                        (b.autoSelection.speedOptimized ? 1 : 0) + 
                        (b.autoSelection.qualityOptimized ? 1 : 0);
          if (aScore !== bScore) return bScore - aScore;
          return a.performance.latency - b.performance.latency;
        })[0]?.id || 'openai-gpt-3.5-turbo';
  }
}

// Helper function to get model pricing info
export function getModelPricing(modelId: string) {
  const model = chatModels.find(m => m.id === modelId);
  return model?.pricing;
}

// Helper function to get model performance info
export function getModelPerformance(modelId: string) {
  const model = chatModels.find(m => m.id === modelId);
  return model?.performance;
}
