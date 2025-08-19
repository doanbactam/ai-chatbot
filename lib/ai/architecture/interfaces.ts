// Shared interfaces for all AI modules
// This file ensures compatibility between parallel development teams

export interface AIProvider {
  id: string;
  name: string;
  type: 'llm' | 'image' | 'embedding' | 'multimodal';
  models: string[];
  isAvailable: boolean;
  priority: number;
  costPerToken: number;
}

export interface AIAgent {
  id: string;
  key: string;
  displayName: string;
  role: string;
  model: string;
  systemPrompt: string;
  color: string;
  isEnabled: boolean;
  tools: string[];
  maxTokens: number;
  temperature: number;
  performance: AgentPerformance;
}

export interface AgentPerformance {
  successRate: number;
  avgResponseTime: number;
  totalRequests: number;
  lastUsed: Date;
  userSatisfaction: number;
}

export interface AITool {
  id: string;
  name: string;
  description: string;
  category: 'utility' | 'analysis' | 'creation' | 'integration';
  inputSchema: any;
  outputSchema: any;
  isEnabled: boolean;
  rateLimit: number;
  costPerCall: number;
}

export interface AIPrompt {
  id: string;
  name: string;
  content: string;
  version: string;
  category: string;
  performance: PromptPerformance;
  variables: string[];
}

export interface PromptPerformance {
  successRate: number;
  userRating: number;
  usageCount: number;
  lastUpdated: Date;
}

export interface AIWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: string[];
  isEnabled: boolean;
  executionHistory: WorkflowExecution[];
}

export interface WorkflowStep {
  id: string;
  type: 'agent' | 'tool' | 'condition' | 'loop';
  config: any;
  dependencies: string[];
  timeout: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  steps: WorkflowStepResult[];
}

export interface WorkflowStepResult {
  stepId: string;
  status: 'success' | 'failed' | 'skipped';
  result?: any;
  error?: string;
  duration: number;
}

export interface AICache {
  key: string;
  value: any;
  ttl: number;
  createdAt: Date;
  accessCount: number;
  lastAccessed: Date;
}

export interface AIRouting {
  agentId: string;
  score: number;
  reason: string;
  context: any;
}

export interface AIAnalytics {
  requestId: string;
  userId: string;
  agentId?: string;
  toolId?: string;
  promptId?: string;
  startTime: Date;
  endTime: Date;
  tokensUsed: number;
  cost: number;
  success: boolean;
  error?: string;
  userFeedback?: number;
}

export interface AISecurity {
  content: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  categories: string[];
  confidence: number;
  actions: SecurityAction[];
}

export interface SecurityAction {
  type: 'block' | 'flag' | 'modify' | 'allow';
  reason: string;
  severity: number;
}

export interface AILearning {
  input: any;
  output: any;
  feedback: number;
  context: any;
  timestamp: Date;
}

export interface AIPersonalization {
  userId: string;
  preferences: UserPreferences;
  behavior: UserBehavior;
  recommendations: Recommendation[];
}

export interface UserPreferences {
  language: string;
  responseStyle: 'concise' | 'detailed' | 'technical' | 'casual';
  topics: string[];
  excludedTopics: string[];
}

export interface UserBehavior {
  commonQueries: string[];
  preferredAgents: string[];
  responseTime: number;
  satisfactionTrend: number[];
}

export interface Recommendation {
  type: 'agent' | 'tool' | 'workflow' | 'prompt';
  itemId: string;
  score: number;
  reason: string;
}