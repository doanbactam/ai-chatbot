// Centralized configuration for all AI modules
// Environment variables can override these defaults

export const AI_CONFIG = {
  // Provider Configuration
  providers: {
    default: process.env.AI_DEFAULT_PROVIDER || 'xai',
    fallback: process.env.AI_FALLBACK_PROVIDER || 'openai',
    timeout: parseInt(process.env.AI_PROVIDER_TIMEOUT || '30000'),
    retryAttempts: parseInt(process.env.AI_RETRY_ATTEMPTS || '3'),
    healthCheckInterval: parseInt(process.env.AI_HEALTH_CHECK_INTERVAL || '60000'),
  },

  // Caching Configuration
  caching: {
    enabled: process.env.AI_CACHE_ENABLED !== 'false',
    provider: process.env.AI_CACHE_PROVIDER || 'redis',
    ttl: parseInt(process.env.AI_CACHE_TTL || '300000'), // 5 minutes
    maxSize: parseInt(process.env.AI_CACHE_MAX_SIZE || '10000'),
    cleanupInterval: parseInt(process.env.AI_CACHE_CLEANUP_INTERVAL || '300000'),
  },

  // Routing Configuration
  routing: {
    algorithm: process.env.AI_ROUTING_ALGORITHM || 'semantic',
    maxAgents: parseInt(process.env.AI_MAX_AGENTS || '5'),
    minScore: parseFloat(process.env.AI_MIN_ROUTING_SCORE || '0.3'),
    contextWindow: parseInt(process.env.AI_CONTEXT_WINDOW || '1000'),
    embeddingModel: process.env.AI_EMBEDDING_MODEL || 'text-embedding-ada-002',
  },

  // Tools Configuration
  tools: {
    maxToolsPerRequest: parseInt(process.env.AI_MAX_TOOLS || '10'),
    executionTimeout: parseInt(process.env.AI_TOOL_TIMEOUT || '30000'),
    rateLimit: parseInt(process.env.AI_TOOL_RATE_LIMIT || '100'),
    enableWebSearch: process.env.AI_ENABLE_WEB_SEARCH !== 'false',
    enableFileAnalysis: process.env.AI_ENABLE_FILE_ANALYSIS !== 'false',
  },

  // Prompts Configuration
  prompts: {
    versioning: process.env.AI_PROMPT_VERSIONING !== 'false',
    aTesting: process.env.AI_PROMPT_AB_TESTING !== 'false',
    maxVersions: parseInt(process.env.AI_MAX_PROMPT_VERSIONS || '10'),
    performanceTracking: process.env.AI_PROMPT_PERFORMANCE !== 'false',
  },

  // Analytics Configuration
  analytics: {
    enabled: process.env.AI_ANALYTICS_ENABLED !== 'false',
    storage: process.env.AI_ANALYTICS_STORAGE || 'database',
    retentionDays: parseInt(process.env.AI_ANALYTICS_RETENTION || '90'),
    realTime: process.env.AI_ANALYTICS_REALTIME !== 'false',
    costTracking: process.env.AI_COST_TRACKING !== 'false',
  },

  // Security Configuration
  security: {
    contentFiltering: process.env.AI_CONTENT_FILTERING !== 'false',
    biasDetection: process.env.AI_BIAS_DETECTION !== 'false',
    dataPrivacy: process.env.AI_DATA_PRIVACY !== 'false',
    maxRiskLevel: process.env.AI_MAX_RISK_LEVEL || 'medium',
    moderationAPI: process.env.AI_MODERATION_API || 'openai',
  },

  // Workflows Configuration
  workflows: {
    enabled: process.env.AI_WORKFLOWS_ENABLED !== 'false',
    maxSteps: parseInt(process.env.AI_MAX_WORKFLOW_STEPS || '20'),
    executionTimeout: parseInt(process.env.AI_WORKFLOW_TIMEOUT || '300000'),
    parallelExecution: process.env.AI_WORKFLOW_PARALLEL !== 'false',
    visualBuilder: process.env.AI_WORKFLOW_VISUAL_BUILDER !== 'false',
  },

  // Learning Configuration
  learning: {
    enabled: process.env.AI_LEARNING_ENABLED !== 'false',
    feedbackCollection: process.env.AI_FEEDBACK_COLLECTION !== 'false',
    modelRetraining: process.env.AI_MODEL_RETRAINING !== 'false',
    improvementThreshold: parseFloat(process.env.AI_IMPROVEMENT_THRESHOLD || '0.7'),
    dataRetention: parseInt(process.env.AI_LEARNING_RETENTION || '365'),
  },

  // Personalization Configuration
  personalization: {
    enabled: process.env.AI_PERSONALIZATION_ENABLED !== 'false',
    userProfiling: process.env.AI_USER_PROFILING !== 'false',
    recommendationEngine: process.env.AI_RECOMMENDATION_ENGINE !== 'false',
    adaptiveResponses: process.env.AI_ADAPTIVE_RESPONSES !== 'false',
    privacyCompliant: process.env.AI_PRIVACY_COMPLIANT !== 'false',
  },

  // Marketplace Configuration
  marketplace: {
    enabled: process.env.AI_MARKETPLACE_ENABLED !== 'false',
    publicSharing: process.env.AI_PUBLIC_SHARING !== 'false',
    ratingSystem: process.env.AI_RATING_SYSTEM !== 'false',
    monetization: process.env.AI_MONETIZATION !== 'false',
    moderation: process.env.AI_MARKETPLACE_MODERATION !== 'false',
  },

  // Collaboration Configuration
  collaboration: {
    enabled: process.env.AI_COLLABORATION_ENABLED !== 'false',
    multiAgent: process.env.AI_MULTI_AGENT !== 'false',
    knowledgeSharing: process.env.AI_KNOWLEDGE_SHARING !== 'false',
    conflictResolution: process.env.AI_CONFLICT_RESOLUTION !== 'false',
    consensusBuilding: process.env.AI_CONSENSUS_BUILDING !== 'false',
  },
} as const;

// User tier configurations
export const USER_TIERS = {
  free: {
    maxAgents: 3,
    maxTools: 5,
    maxWorkflows: 2,
    cacheTTL: 300000, // 5 minutes
    rateLimit: 100,
    costLimit: 10, // $10 per month
  },
  premium: {
    maxAgents: 10,
    maxTools: 20,
    maxWorkflows: 10,
    cacheTTL: 1800000, // 30 minutes
    rateLimit: 500,
    costLimit: 100, // $100 per month
  },
  enterprise: {
    maxAgents: 100,
    maxTools: 100,
    maxWorkflows: 100,
    cacheTTL: 3600000, // 1 hour
    rateLimit: 5000,
    costLimit: 1000, // $1000 per month
  },
} as const;

// Feature flags for gradual rollout
export const FEATURE_FLAGS = {
  newRouting: process.env.AI_FEATURE_NEW_ROUTING === 'true',
  advancedCaching: process.env.AI_FEATURE_ADVANCED_CACHING === 'true',
  semanticSearch: process.env.AI_FEATURE_SEMANTIC_SEARCH === 'true',
  workflowBuilder: process.env.AI_FEATURE_WORKFLOW_BUILDER === 'true',
  agentMarketplace: process.env.AI_FEATURE_AGENT_MARKETPLACE === 'true',
  multiLanguage: process.env.AI_FEATURE_MULTI_LANGUAGE === 'true',
} as const;