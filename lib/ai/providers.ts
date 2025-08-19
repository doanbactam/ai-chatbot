import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { xai } from '@ai-sdk/xai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { mistral } from '@ai-sdk/mistral';
import { cohere } from '@ai-sdk/cohere';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { isTestEnvironment } from '../constants';
import { chatModels } from './models';
import { 
  openaiConfig, 
  anthropicConfig, 
  googleConfig, 
  mistralConfig, 
  cohereConfig 
} from './provider-config';

// Helper function to get model by ID
function getModelById(modelId: string) {
  return chatModels.find(model => model.id === modelId);
}

// Create provider instances for each AI service with optimized configurations
const createOpenAIProvider = () => {
  return customProvider({
    languageModels: {
      'openai-gpt-4': openai('gpt-4'),
      'openai-gpt-3.5-turbo': openai('gpt-3.5-turbo'),
    },
  });
};

const createAnthropicProvider = () => {
  return customProvider({
    languageModels: {
      'anthropic-claude-3.5-sonnet': anthropic('claude-3-5-sonnet-20241022'),
      'anthropic-claude-3-haiku': anthropic('claude-3-haiku-20240307'),
    },
  });
};

const createGoogleProvider = () => {
  return customProvider({
    languageModels: {
      'google-gemini-pro': google('gemini-1.5-pro'),
    },
  });
};

const createMistralProvider = () => {
  return customProvider({
    languageModels: {
      'mistral-mixtral': mistral('mixtral-8x7b-instruct'),
      'mistral-7b': mistral('mistral-7b-instruct'),
    },
  });
};

const createCohereProvider = () => {
  return customProvider({
    languageModels: {
      'cohere-command-r-plus': cohere('command-r-plus'),
    },
  });
};

const createXAIProvider = () => {
  return customProvider({
    languageModels: {
      'chat-model': xai('grok-2-vision-1212'),
      'chat-model-reasoning': wrapLanguageModel({
        model: xai('grok-3-mini-beta'),
        middleware: extractReasoningMiddleware({ tagName: 'think' }),
      }),
      'title-model': xai('grok-2-1212'),
      'artifact-model': xai('grok-2-1212'),
    },
    imageModels: {
      'small-model': xai.imageModel('grok-2-image'),
    },
  });
};

// Main provider that routes to appropriate provider based on model ID
export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        // XAI Models
        'chat-model': xai('grok-2-vision-1212'),
        'chat-model-reasoning': wrapLanguageModel({
          model: xai('grok-3-mini-beta'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': xai('grok-2-1212'),
        'artifact-model': xai('grok-2-1212'),
        
        // OpenAI Models
        'openai-gpt-4': openai('gpt-4'),
        'openai-gpt-3.5-turbo': openai('gpt-3.5-turbo'),
        
        // Anthropic Models
        'anthropic-claude-3.5-sonnet': anthropic('claude-3-5-sonnet-20241022'),
        'anthropic-claude-3-haiku': anthropic('claude-3-haiku-20240307'),
        
        // Google Models
        'google-gemini-pro': google('gemini-1.5-pro'),
        
        // Mistral Models
        'mistral-mixtral': mistral('mixtral-8x7b-instruct'),
        'mistral-7b': mistral('mistral-7b-instruct'),
        
        // Cohere Models
        'cohere-command-r-plus': cohere('command-r-plus'),
      },
      imageModels: {
        'small-model': xai.imageModel('grok-2-image'),
      },
    });

// Helper function to get provider for a specific model
export function getProviderForModel(modelId: string) {
  const model = getModelById(modelId);
  if (!model) return null;
  
  switch (model.provider) {
    case 'openai':
      return createOpenAIProvider();
    case 'anthropic':
      return createAnthropicProvider();
    case 'google':
      return createGoogleProvider();
    case 'mistral':
      return createMistralProvider();
    case 'cohere':
      return createCohereProvider();
    case 'xai':
      return createXAIProvider();
    default:
      return null;
  }
}

// Helper function to check if model supports specific capability
export function modelSupportsCapability(modelId: string, capability: string): boolean {
  const model = getModelById(modelId);
  return model?.capabilities.includes(capability) ?? false;
}

// Helper function to get model configuration
export function getModelConfiguration(modelId: string) {
  const model = getModelById(modelId);
  if (!model) return null;
  
  switch (model.provider) {
    case 'openai':
      return openaiConfig.models[model.model as keyof typeof openaiConfig.models];
    case 'anthropic':
      return anthropicConfig.models[model.model as keyof typeof anthropicConfig.models];
    case 'google':
      return googleConfig.models[model.model as keyof typeof googleConfig.models];
    case 'mistral':
      return mistralConfig.models[model.model as keyof typeof mistralConfig.models];
    case 'cohere':
      return cohereConfig.models[model.model as keyof typeof cohereConfig.models];
    default:
      return null;
  }
}
