

// OpenAI Provider Configuration
export const openaiConfig = {
  apiKey: process.env.OPENAI_API_KEY,
  models: {
    'gpt-4': {
      maxTokens: 8192,
      temperature: 0.7,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    },
    'gpt-3.5-turbo': {
      maxTokens: 4096,
      temperature: 0.7,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    },
  },
};

// Anthropic Provider Configuration
export const anthropicConfig = {
  apiKey: process.env.ANTHROPIC_API_KEY,
  models: {
    'claude-3-5-sonnet-20241022': {
      maxTokens: 4096,
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
    },
    'claude-3-haiku-20240307': {
      maxTokens: 4096,
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
    },
  },
};

// Google Provider Configuration
export const googleConfig = {
  apiKey: process.env.GOOGLE_API_KEY,
  models: {
    'gemini-1.5-pro': {
      maxOutputTokens: 8192,
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
    },
  },
};

// Mistral Provider Configuration
export const mistralConfig = {
  apiKey: process.env.MISTRAL_API_KEY,
  models: {
    'mixtral-8x7b-instruct': {
      maxTokens: 4096,
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
    },
    'mistral-7b-instruct': {
      maxTokens: 4096,
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
    },
  },
};

// Cohere Provider Configuration
export const cohereConfig = {
  apiKey: process.env.COHERE_API_KEY,
  models: {
    'command-r-plus': {
      maxTokens: 4096,
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      frequencyPenalty: 0,
      presencePenalty: 0,
    },
  },
};

// Helper function to get model configuration
export function getModelConfig(provider: string, model: string) {
  switch (provider) {
    case 'openai':
      return openaiConfig.models[model as keyof typeof openaiConfig.models];
    case 'anthropic':
      return anthropicConfig.models[model as keyof typeof anthropicConfig.models];
    case 'google':
      return googleConfig.models[model as keyof typeof googleConfig.models];
    case 'mistral':
      return mistralConfig.models[model as keyof typeof mistralConfig.models];
    case 'cohere':
      return cohereConfig.models[model as keyof typeof cohereConfig.models];
    default:
      return null;
  }
}

// Helper function to validate API keys
export function validateProviderConfig() {
  const missingKeys: string[] = [];
  
  if (!process.env.OPENAI_API_KEY) missingKeys.push('OPENAI_API_KEY');
  if (!process.env.ANTHROPIC_API_KEY) missingKeys.push('ANTHROPIC_API_KEY');
  if (!process.env.GOOGLE_API_KEY) missingKeys.push('GOOGLE_API_KEY');
  if (!process.env.MISTRAL_API_KEY) missingKeys.push('MISTRAL_API_KEY');
  if (!process.env.COHERE_API_KEY) missingKeys.push('COHERE_API_KEY');
  
  return {
    isValid: missingKeys.length === 0,
    missingKeys,
  };
}