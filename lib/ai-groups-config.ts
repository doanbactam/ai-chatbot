// AI Groups Configuration - Token Optimization
export const AI_GROUPS_CONFIG = {
  // Token limits (can be overridden by environment variables)
  MAX_PARALLEL_AGENTS: parseInt(process.env.AI_GROUPS_MAX_PARALLEL_AGENTS || '3'),
  AGENT_TIMEOUT_MS: parseInt(process.env.AI_GROUPS_TIMEOUT_MS || '20000'),
  MAX_OUTPUT_LENGTH: parseInt(process.env.AI_GROUPS_MAX_OUTPUT_LENGTH || '3000'),
  ESTIMATED_TOKENS_PER_AGENT: parseInt(process.env.AI_GROUPS_TOKENS_PER_AGENT || '500'),
  MAX_TOTAL_TOKENS_PER_REQUEST: parseInt(process.env.AI_GROUPS_MAX_TOKENS || '2000'),
  
  // Performance settings
  STREAMING_CHUNK_DELAY_MS: parseInt(process.env.AI_GROUPS_CHUNK_DELAY || '20'),
  ENABLE_SMART_PRIORITIZATION: process.env.AI_GROUPS_SMART_PRIORITY !== 'false',
  
  // Cost optimization
  PREFER_SHORTER_PROMPTS: process.env.AI_GROUPS_PREFER_SHORT_PROMPTS !== 'false',
  TOKEN_ESTIMATION_RATIO: parseFloat(process.env.AI_GROUPS_TOKEN_RATIO || '4'), // chars per token
} as const;

// Helper to get user-specific limits (can be extended for different user tiers)
export function getUserTokenLimits(userType: string) {
  const baseLimits = AI_GROUPS_CONFIG;
  
  switch (userType) {
    case 'premium':
      return {
        ...baseLimits,
        MAX_PARALLEL_AGENTS: Math.min(baseLimits.MAX_PARALLEL_AGENTS * 2, 5),
        MAX_TOTAL_TOKENS_PER_REQUEST: baseLimits.MAX_TOTAL_TOKENS_PER_REQUEST * 2,
      };
    case 'enterprise':
      return {
        ...baseLimits,
        MAX_PARALLEL_AGENTS: 10,
        MAX_TOTAL_TOKENS_PER_REQUEST: baseLimits.MAX_TOTAL_TOKENS_PER_REQUEST * 5,
      };
    default: // free tier
      return baseLimits;
  }
}