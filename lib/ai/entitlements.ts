import type { UserType } from '@/app/(auth)/auth';
import type { ChatModel } from './models';

interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<ChatModel['id']>;
  maxTokensPerMessage?: number;
}

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerDay: 20,
    availableChatModelIds: [
      'chat-model',
      'chat-model-reasoning',
      'openai-gpt-3.5-turbo',
      'anthropic-claude-3-haiku',
      'mistral-7b',
    ],
    maxTokensPerMessage: 1000,
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 100,
    availableChatModelIds: [
      'chat-model',
      'chat-model-reasoning',
      'openai-gpt-4',
      'openai-gpt-3.5-turbo',
      'anthropic-claude-3.5-sonnet',
      'anthropic-claude-3-haiku',
      'google-gemini-pro',
      'mistral-mixtral',
      'mistral-7b',
      'cohere-command-r-plus',
    ],
    maxTokensPerMessage: 4000,
  },

  /*
   * For users with premium membership
   */
  premium: {
    maxMessagesPerDay: 500,
    availableChatModelIds: [
      'chat-model',
      'chat-model-reasoning',
      'openai-gpt-4',
      'openai-gpt-3.5-turbo',
      'anthropic-claude-3.5-sonnet',
      'anthropic-claude-3-haiku',
      'google-gemini-pro',
      'mistral-mixtral',
      'mistral-7b',
      'cohere-command-r-plus',
    ],
    maxTokensPerMessage: 8000,
  },
};
