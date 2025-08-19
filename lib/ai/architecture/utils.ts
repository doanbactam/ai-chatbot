// Common utility functions for all AI modules
// This file provides shared functionality to avoid duplication

import { AI_CONFIG, USER_TIERS, FEATURE_FLAGS } from './config';
import type { AIProvider, AIAgent, AITool, AIPrompt } from './interfaces';

/**
 * Generate unique cache key for AI operations
 */
export function generateCacheKey(
  prefix: string,
  params: Record<string, any>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  
  const hash = Buffer.from(sortedParams).toString('base64').slice(0, 32);
  return `${prefix}:${hash}`;
}

/**
 * Calculate estimated token count for text
 */
export function estimateTokenCount(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English
  return Math.ceil(text.length / 4);
}

/**
 * Calculate cost for AI operation
 */
export function calculateCost(
  tokens: number,
  costPerToken: number
): number {
  return tokens * costPerToken;
}

/**
 * Check if user has access to feature based on tier
 */
export function hasFeatureAccess(
  userTier: keyof typeof USER_TIERS,
  feature: keyof typeof FEATURE_FLAGS
): boolean {
  if (!FEATURE_FLAGS[feature]) return false;
  
  const tierConfig = USER_TIERS[userTier];
  if (!tierConfig) return false;
  
  // Add tier-specific feature checks here
  return true;
}

/**
 * Validate AI provider configuration
 */
export function validateProvider(provider: AIProvider): boolean {
  return (
    provider.id &&
    provider.name &&
    provider.type &&
    provider.models.length > 0 &&
    typeof provider.isAvailable === 'boolean' &&
    provider.priority >= 0 &&
    provider.costPerToken >= 0
  );
}

/**
 * Validate AI agent configuration
 */
export function validateAgent(agent: AIAgent): boolean {
  return (
    agent.id &&
    agent.key &&
    agent.displayName &&
    agent.role &&
    agent.model &&
    agent.systemPrompt &&
    agent.color &&
    typeof agent.isEnabled === 'boolean' &&
    agent.maxTokens > 0 &&
    agent.temperature >= 0 &&
    agent.temperature <= 2
  );
}

/**
 * Validate AI tool configuration
 */
export function validateTool(tool: AITool): boolean {
  return (
    tool.id &&
    tool.name &&
    tool.description &&
    tool.category &&
    tool.inputSchema &&
    tool.outputSchema &&
    typeof tool.isEnabled === 'boolean' &&
    tool.rateLimit > 0 &&
    tool.costPerCall >= 0
  );
}

/**
 * Validate AI prompt configuration
 */
export function validatePrompt(prompt: AIPrompt): boolean {
  return (
    prompt.id &&
    prompt.name &&
    prompt.content &&
    prompt.version &&
    prompt.category &&
    prompt.variables &&
    prompt.performance
  );
}

/**
 * Generate performance score for AI operations
 */
export function calculatePerformanceScore(
  successRate: number,
  responseTime: number,
  userSatisfaction: number,
  costEfficiency: number
): number {
  const weights = {
    successRate: 0.3,
    responseTime: 0.25,
    userSatisfaction: 0.25,
    costEfficiency: 0.2,
  };
  
  // Normalize response time (lower is better)
  const normalizedResponseTime = Math.max(0, 1 - (responseTime / 10000));
  
  return (
    successRate * weights.successRate +
    normalizedResponseTime * weights.responseTime +
    userSatisfaction * weights.userSatisfaction +
    costEfficiency * weights.costEfficiency
  );
}

/**
 * Check if content should be cached
 */
export function shouldCacheContent(
  content: string,
  userTier: keyof typeof USER_TIERS
): boolean {
  if (!AI_CONFIG.caching.enabled) return false;
  
  // Don't cache sensitive content
  const sensitiveKeywords = [
    'password', 'secret', 'private', 'confidential',
    'personal', 'credit', 'ssn', 'token'
  ];
  
  const contentLower = content.toLowerCase();
  if (sensitiveKeywords.some(keyword => contentLower.includes(keyword))) {
    return false;
  }
  
  // Check user tier limits
  const tierConfig = USER_TIERS[userTier];
  if (tierConfig && content.length > tierConfig.cacheTTL) {
    return false;
  }
  
  return true;
}

/**
 * Generate user-friendly error messages
 */
export function generateErrorMessage(
  error: Error,
  context: string
): string {
  const errorMap: Record<string, string> = {
    'rate_limit': 'Rate limit exceeded. Please try again later.',
    'quota_exceeded': 'Quota exceeded. Please upgrade your plan.',
    'invalid_request': 'Invalid request. Please check your input.',
    'model_not_found': 'AI model not available. Please try another model.',
    'timeout': 'Request timed out. Please try again.',
    'network_error': 'Network error. Please check your connection.',
    'authentication_error': 'Authentication failed. Please sign in again.',
    'authorization_error': 'Access denied. Please check your permissions.',
  };
  
  const errorType = error.message.toLowerCase().replace(/\s+/g, '_');
  const defaultMessage = 'An unexpected error occurred. Please try again.';
  
  return errorMap[errorType] || defaultMessage;
}

/**
 * Format AI response for display
 */
export function formatAIResponse(
  response: string,
  format: 'markdown' | 'html' | 'plain' = 'markdown'
): string {
  switch (format) {
    case 'html':
      return response
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
    
    case 'plain':
      return response
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`([^`]+)`/g, '$1');
    
    default:
      return response;
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for rate limiting
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i === maxRetries - 1) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Generate unique ID for AI operations
 */
export function generateAIId(prefix: string = 'ai'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Check if environment supports feature
 */
export function isFeatureSupported(feature: string): boolean {
  const supportedFeatures = [
    'redis',
    'embeddings',
    'web_search',
    'file_analysis',
    'code_execution',
    'workflows',
    'marketplace',
    'collaboration'
  ];
  
  return supportedFeatures.includes(feature);
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig(): Record<string, any> {
  const env = process.env.NODE_ENV || 'development';
  
  const configs = {
    development: {
      debug: true,
      logLevel: 'debug',
      cacheEnabled: false,
      rateLimit: 1000,
    },
    staging: {
      debug: true,
      logLevel: 'info',
      cacheEnabled: true,
      rateLimit: 500,
    },
    production: {
      debug: false,
      logLevel: 'warn',
      cacheEnabled: true,
      rateLimit: 100,
    },
  };
  
  return configs[env as keyof typeof configs] || configs.development;
}