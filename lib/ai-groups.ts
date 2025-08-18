import 'server-only';

import { streamText, convertToModelMessages } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { systemPrompt, type RequestHints } from '@/lib/ai/prompts';
import { getActiveAgentsByGroupId } from '@/lib/db/groups';
import type { AiAgent } from '@/lib/db/schema';
import type { ChatMessage } from '@/lib/types';

import { AI_GROUPS_CONFIG, getUserTokenLimits } from './ai-groups-config';
import { getCachedResponse, setCachedResponse, shouldCacheResponse } from './ai-groups-cache';

export interface AgentResponse {
  agentId: string;
  agentKey: string;
  displayName: string;
  status: 'success' | 'failed' | 'timeout';
  response?: string;
  error?: string;
  responseTime: number;
  color?: string;
}

export interface OrchestratorResult {
  responses: AgentResponse[];
  totalTime: number;
  hasErrors: boolean;
  warningMessage?: string;
  tokenOptimization: {
    agentsRequested: number;
    agentsExecuted: number;
    estimatedTokensSaved: number;
    reason?: string;
  };
}

/**
 * Parse @tags from user message
 * @param message User message text
 * @returns Array of agent keys mentioned with @
 */
export function parseAgentTags(message: string): string[] {
  const tagRegex = /@([a-zA-Z0-9_-]+)/g;
  const tags: string[] = [];
  let match;
  
  while ((match = tagRegex.exec(message)) !== null) {
    tags.push(match[1].toLowerCase());
  }
  
  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Filter agents based on @tags or return all if no tags
 */
export function filterAgentsByTags(
  agents: Array<AiAgent & { localEnabled: boolean }>,
  tags: string[]
): Array<AiAgent & { localEnabled: boolean }> {
  if (tags.length === 0) {
    return agents; // No tags = send to all agents
  }
  
  return agents.filter(agent => 
    tags.includes(agent.key.toLowerCase())
  );
}

/**
 * Smart agent prioritization based on relevance and cost
 */
export function prioritizeAgents(
  agents: Array<AiAgent & { localEnabled: boolean }>,
  userMessage: string
): Array<AiAgent & { localEnabled: boolean }> {
  // Simple keyword-based relevance scoring
  const scoredAgents = agents.map(agent => {
    let score = 0;
    const messageWords = userMessage.toLowerCase().split(' ');
    const agentKeywords = [
      agent.key.toLowerCase(),
      agent.displayName.toLowerCase(),
      agent.role.toLowerCase(),
      ...(agent.systemPrompt?.toLowerCase().split(' ') || [])
    ];
    
    // Score based on keyword matches
    messageWords.forEach(word => {
      if (agentKeywords.some(keyword => keyword.includes(word) || word.includes(keyword))) {
        score += 1;
      }
    });
    
    // Boost score for shorter system prompts (cheaper)
    const promptLength = agent.systemPrompt?.length || 0;
    if (promptLength < 200) score += 2;
    else if (promptLength < 500) score += 1;
    
    return { agent, score };
  });
  
  // Sort by score (descending) and return agents
  return scoredAgents
    .sort((a, b) => b.score - a.score)
    .map(item => item.agent);
}

/**
 * Estimate tokens for a message (rough approximation)
 */
function estimateTokens(text: string): number {
  // Use configurable ratio
  return Math.ceil(text.length / AI_GROUPS_CONFIG.TOKEN_ESTIMATION_RATIO);
}

/**
 * Calculate dynamic token budget for agent
 */
function calculateAgentTokenBudget(
  agent: AiAgent & { localEnabled: boolean },
  messages: ChatMessage[]
): number {
  const systemPromptTokens = estimateTokens(agent.systemPrompt || '');
  const messagesTokens = messages.reduce((total, msg) => {
    const messageText = msg.parts
      .filter(part => part.type === 'text')
      .map(part => part.text)
      .join(' ');
    return total + estimateTokens(messageText);
  }, 0);
  
  const inputTokens = systemPromptTokens + messagesTokens;
  const maxResponseTokens = parseInt(agent.maxTokens || '2000');
  
  return inputTokens + maxResponseTokens;
}

/**
 * Execute single agent with timeout
 */
async function executeAgent(
  agent: AiAgent & { localEnabled: boolean },
  messages: ChatMessage[],
  requestHints: RequestHints,
  selectedChatModel: string
): Promise<AgentResponse> {
  const startTime = Date.now();
  
  try {
    // Create optimized agent-specific system prompt
    const agentSystemPrompt = agent.systemPrompt 
      ? `Role: ${agent.role}. ${agent.systemPrompt}` // Use custom prompt if available
      : `You are a ${agent.role} AI assistant. Respond concisely and helpfully.`; // Shorter default prompt
    
    // Check cache first (if enabled)
    const userMessageText = messages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.parts.filter(part => part.type === 'text').map(part => part.text).join(' '))
      .join(' ');
      
    if (shouldCacheResponse(userMessageText)) {
      const cachedResponse = getCachedResponse(agent.id, userMessageText, agentSystemPrompt);
      if (cachedResponse) {
        return {
          agentId: agent.id,
          agentKey: agent.key,
          displayName: agent.displayName,
          status: 'success',
          response: cachedResponse + ' [cached]',
          responseTime: Date.now() - startTime,
          color: agent.color || undefined,
        };
      }
    }
    
    // Execute with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Agent timeout')), AI_GROUPS_CONFIG.AGENT_TIMEOUT_MS);
    });
    
    const executePromise = (async () => {
      const result = await streamText({
        model: myProvider.languageModel(agent.model || selectedChatModel),
        system: agentSystemPrompt,
        messages: convertToModelMessages(messages),
        temperature: parseFloat(agent.temperature || '0.7'),
      });
      
      // Get text response
      let responseText = '';
      for await (const textPart of result.textStream) {
        responseText += textPart;
        
        // Limit output length
        if (responseText.length > AI_GROUPS_CONFIG.MAX_OUTPUT_LENGTH) {
          responseText = responseText.substring(0, AI_GROUPS_CONFIG.MAX_OUTPUT_LENGTH) + '\n\n[Output truncated due to length limit]';
          break;
        }
      }
      
      return responseText;
    })();
    
    const responseText = await Promise.race([executePromise, timeoutPromise]);
    
    // Cache the response if caching is enabled
    if (shouldCacheResponse(userMessageText)) {
      setCachedResponse(agent.id, userMessageText, agentSystemPrompt, responseText);
    }
    
    return {
      agentId: agent.id,
      agentKey: agent.key,
      displayName: agent.displayName,
      status: 'success',
      response: responseText,
      responseTime: Date.now() - startTime,
      color: agent.color || undefined,
    };
    
  } catch (error) {
    const isTimeout = error instanceof Error && error.message === 'Agent timeout';
    
    return {
      agentId: agent.id,
      agentKey: agent.key,
      displayName: agent.displayName,
      status: isTimeout ? 'timeout' : 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
      color: agent.color || undefined,
    };
  }
}

/**
 * Execute multiple agents in parallel with limits
 */
export async function executeAgentsOrchestrator({
  groupId,
  userId,
  messages,
  requestHints,
  selectedChatModel,
  userMessage,
  userType = 'free',
}: {
  groupId: string;
  userId: string;
  messages: ChatMessage[];
  requestHints: RequestHints;
  selectedChatModel: string;
  userMessage: string;
  userType?: string;
}): Promise<OrchestratorResult> {
  const startTime = Date.now();
  
  try {
    // Get user-specific token limits
    const tokenLimits = getUserTokenLimits(userType);
    
    // Get active agents for group
    const allAgents = await getActiveAgentsByGroupId({ groupId, userId });
    
    if (allAgents.length === 0) {
      return {
        responses: [],
        totalTime: Date.now() - startTime,
        hasErrors: false,
        warningMessage: 'No active agents found in this group. Please add and enable agents to get responses.',
        tokenOptimization: {
          agentsRequested: 0,
          agentsExecuted: 0,
          estimatedTokensSaved: 0,
        },
      };
    }
    
    // Parse @tags and filter agents
    const tags = parseAgentTags(userMessage);
    let targetAgents = filterAgentsByTags(allAgents, tags);
    
    // If no specific tags, use smart prioritization to select most relevant agents
    if (tags.length === 0 && targetAgents.length > 1) {
      targetAgents = prioritizeAgents(targetAgents, userMessage);
    }
    
    if (targetAgents.length === 0 && tags.length > 0) {
      return {
        responses: [],
        totalTime: Date.now() - startTime,
        hasErrors: false,
        warningMessage: `No agents found for tags: ${tags.map(t => '@' + t).join(', ')}. Available agents: ${allAgents.map(a => '@' + a.key).join(', ')}.`,
        tokenOptimization: {
          agentsRequested: allAgents.length,
          agentsExecuted: 0,
          estimatedTokensSaved: allAgents.length * AI_GROUPS_CONFIG.ESTIMATED_TOKENS_PER_AGENT,
          reason: 'invalid_tags',
        },
      };
    }
    
    // Calculate dynamic token usage and select agents within budget
    let totalTokenBudget = 0;
    const agentsToExecute: Array<AiAgent & { localEnabled: boolean }> = [];
    let warningMessage: string | undefined;
    
    for (const agent of targetAgents) {
      const agentTokenBudget = calculateAgentTokenBudget(agent, messages);
      
      // Check if we can afford this agent
      if (
        agentsToExecute.length < tokenLimits.MAX_PARALLEL_AGENTS && 
        totalTokenBudget + agentTokenBudget <= tokenLimits.MAX_TOTAL_TOKENS_PER_REQUEST
      ) {
        agentsToExecute.push(agent);
        totalTokenBudget += agentTokenBudget;
      } else {
        // Stop adding agents due to budget or parallel limit
        break;
      }
    }
    
    const agentsSkippedCount = targetAgents.length - agentsToExecute.length;
    if (agentsSkippedCount > 0) {
      const estimatedTokensSaved = agentsSkippedCount * tokenLimits.ESTIMATED_TOKENS_PER_AGENT;
      const reason = totalTokenBudget >= tokenLimits.MAX_TOTAL_TOKENS_PER_REQUEST ? 'token budget' : 'parallel limit';
      warningMessage = `Executing ${agentsToExecute.length}/${targetAgents.length} agents due to ${reason}. ~${estimatedTokensSaved} tokens saved.`;
    }
    
    // Execute agents in parallel
    const agentPromises = agentsToExecute.map(agent =>
      executeAgent(agent, messages, requestHints, selectedChatModel)
    );
    
    const responses = await Promise.all(agentPromises);
    
    // Calculate final token optimization metrics
    const agentsSkipped = targetAgents.length - agentsToExecute.length;
    const estimatedTokensSaved = agentsSkipped * AI_GROUPS_CONFIG.ESTIMATED_TOKENS_PER_AGENT;
    
    return {
      responses,
      totalTime: Date.now() - startTime,
      hasErrors: responses.some(r => r.status !== 'success'),
      warningMessage,
      tokenOptimization: {
        agentsRequested: targetAgents.length,
        agentsExecuted: agentsToExecute.length,
        estimatedTokensSaved,
        reason: agentsSkipped > 0 ? (totalTokenBudget >= tokenLimits.MAX_TOTAL_TOKENS_PER_REQUEST ? 'token_budget' : 'parallel_limit') : undefined,
      },
    };
    
  } catch (error) {
    console.error('Orchestrator error:', error);
    
    return {
      responses: [],
      totalTime: Date.now() - startTime,
      hasErrors: true,
      warningMessage: 'Failed to execute agents: ' + (error instanceof Error ? error.message : 'Unknown error'),
      tokenOptimization: {
        agentsRequested: 0,
        agentsExecuted: 0,
        estimatedTokensSaved: 0,
      },
    };
  }
}

/**
 * Format orchestrator result as markdown
 */
export function formatOrchestratorResponse(result: OrchestratorResult): string {
  if (result.warningMessage && result.responses.length === 0) {
    return `⚠️ **${result.warningMessage}**`;
  }
  
  let output = '';
  
  // Add warning if exists
  if (result.warningMessage) {
    output += `⚠️ **Warning:** ${result.warningMessage}\n\n`;
  }
  
  // Add each agent response as a section
  result.responses.forEach((response, index) => {
    const statusEmoji = response.status === 'success' ? '✅' : 
                       response.status === 'timeout' ? '⏱️' : '❌';
    
    output += `## ${statusEmoji} ${response.displayName} (@${response.agentKey})\n\n`;
    
    if (response.status === 'success' && response.response) {
      output += response.response + '\n\n';
    } else {
      output += `*${response.status === 'timeout' ? 'Response timed out' : 'Failed to respond'}: ${response.error || 'Unknown error'}*\n\n`;
    }
    
    // Add separator between responses (except last one)
    if (index < result.responses.length - 1) {
      output += '---\n\n';
    }
  });
  
  // Add execution summary with token optimization info
  if (result.responses.length > 0) {
    const successCount = result.responses.filter(r => r.status === 'success').length;
    output += `\n*Executed ${result.responses.length} agents in ${result.totalTime}ms. ${successCount} successful.*`;
    
    // Add token optimization info
    if (result.tokenOptimization.estimatedTokensSaved > 0) {
      output += `\n*Token optimization: ~${result.tokenOptimization.estimatedTokensSaved} tokens saved by limiting agents.*`;
    }
  }
  
  return output;
}

/**
 * Check if message should use orchestrator (has groupId)
 */
export function shouldUseOrchestrator(groupId?: string): boolean {
  return Boolean(groupId);
}