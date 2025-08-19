export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  model: string;
  capabilities: string[];
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
  },
  {
    id: 'chat-model-reasoning',
    name: 'Grok-3 Mini Beta',
    description: 'Uses advanced reasoning capabilities',
    provider: 'xai',
    model: 'grok-3-mini-beta',
    capabilities: ['text', 'reasoning'],
  },
  
  // OpenAI Models
  {
    id: 'openai-gpt-4',
    name: 'GPT-4',
    description: 'Most capable GPT model for complex tasks',
    provider: 'openai',
    model: 'gpt-4',
    capabilities: ['text', 'reasoning', 'code'],
  },
  {
    id: 'openai-gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient for most tasks',
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    capabilities: ['text', 'code'],
  },
  
  // Anthropic Models
  {
    id: 'anthropic-claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Balanced performance and speed',
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    capabilities: ['text', 'reasoning', 'code'],
  },
  {
    id: 'anthropic-claude-3-haiku',
    name: 'Claude 3 Haiku',
    description: 'Fastest Claude model for quick responses',
    provider: 'anthropic',
    model: 'claude-3-haiku-20240307',
    capabilities: ['text', 'code'],
  },
  
  // Google Models
  {
    id: 'google-gemini-pro',
    name: 'Gemini Pro',
    description: 'Google\'s most capable AI model',
    provider: 'google',
    model: 'gemini-1.5-pro',
    capabilities: ['text', 'reasoning', 'code'],
  },
  
  // Mistral Models
  {
    id: 'mistral-mixtral',
    name: 'Mixtral 8x7B',
    description: 'High-performance open-source model',
    provider: 'mistral',
    model: 'mixtral-8x7b-instruct',
    capabilities: ['text', 'code'],
  },
  {
    id: 'mistral-7b',
    name: 'Mistral 7B',
    description: 'Efficient and fast open-source model',
    provider: 'mistral',
    model: 'mistral-7b-instruct',
    capabilities: ['text', 'code'],
  },
  
  // Cohere Models
  {
    id: 'cohere-command-r-plus',
    name: 'Command R+',
    description: 'Cohere\'s most advanced model',
    provider: 'cohere',
    model: 'command-r-plus',
    capabilities: ['text', 'reasoning', 'code'],
  },
];
