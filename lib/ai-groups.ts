import 'server-only';

import { streamText } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { systemPrompt, type RequestHints } from '@/lib/ai/prompts';
import { getActiveAgentsByGroupId } from '@/lib/db/groups';
import type { AiAgent } from '@/lib/db/schema';
import type { ChatMessage } from '@/lib/types';
import { convertToModelMessages } from 'ai';

// Configuration
const MAX_PARALLEL_AGENTS = 5;
const AGENT_TIMEOUT_MS = 30000; // 30 seconds
const MAX_OUTPUT_LENGTH = 5000;

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
    // Create agent-specific system prompt
    const agentSystemPrompt = agent.systemPrompt || systemPrompt({ selectedChatModel, requestHints });
    
    // Execute with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Agent timeout')), AGENT_TIMEOUT_MS);
    });
    
    const executePromise = streamText({
      model: myProvider.languageModel(agent.model || selectedChatModel),
      system: agentSystemPrompt,
      messages: convertToModelMessages(messages),
      maxTokens: parseInt(agent.maxTokens || '2000'),
      temperature: parseFloat(agent.temperature || '0.7'),
    });
    
    const result = await Promise.race([executePromise, timeoutPromise]);
    
    // Get text response
    let responseText = '';
    for await (const textPart of result.textStream) {
      responseText += textPart;
      
      // Limit output length
      if (responseText.length > MAX_OUTPUT_LENGTH) {
        responseText = responseText.substring(0, MAX_OUTPUT_LENGTH) + '\n\n[Output truncated due to length limit]';
        break;
      }
    }
    
    return {
      agentId: agent.id,
      agentKey: agent.key,
      displayName: agent.displayName,
      status: 'success',
      response: responseText,
      responseTime: Date.now() - startTime,
      color: agent.color,
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
      color: agent.color,
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
}: {
  groupId: string;
  userId: string;
  messages: ChatMessage[];
  requestHints: RequestHints;
  selectedChatModel: string;
  userMessage: string;
}): Promise<OrchestratorResult> {
  const startTime = Date.now();
  
  try {
    // Get active agents for group
    const allAgents = await getActiveAgentsByGroupId({ groupId, userId });
    
    if (allAgents.length === 0) {
      return {
        responses: [],
        totalTime: Date.now() - startTime,
        hasErrors: false,
        warningMessage: 'No active agents found in this group. Please add and enable agents to get responses.',
      };
    }
    
    // Parse @tags and filter agents
    const tags = parseAgentTags(userMessage);
    const targetAgents = filterAgentsByTags(allAgents, tags);
    
    if (targetAgents.length === 0 && tags.length > 0) {
      return {
        responses: [],
        totalTime: Date.now() - startTime,
        hasErrors: false,
        warningMessage: `No agents found for tags: ${tags.map(t => '@' + t).join(', ')}. Available agents: ${allAgents.map(a => '@' + a.key).join(', ')}.`,
      };
    }
    
    // Limit parallel execution
    const agentsToExecute = targetAgents.slice(0, MAX_PARALLEL_AGENTS);
    let warningMessage: string | undefined;
    
    if (targetAgents.length > MAX_PARALLEL_AGENTS) {
      warningMessage = `Executing first ${MAX_PARALLEL_AGENTS} agents due to parallel limit. ${targetAgents.length - MAX_PARALLEL_AGENTS} agents skipped.`;
    }
    
    // Execute agents in parallel
    const agentPromises = agentsToExecute.map(agent =>
      executeAgent(agent, messages, requestHints, selectedChatModel)
    );
    
    const responses = await Promise.all(agentPromises);
    
    return {
      responses,
      totalTime: Date.now() - startTime,
      hasErrors: responses.some(r => r.status !== 'success'),
      warningMessage,
    };
    
  } catch (error) {
    console.error('Orchestrator error:', error);
    
    return {
      responses: [],
      totalTime: Date.now() - startTime,
      hasErrors: true,
      warningMessage: 'Failed to execute agents: ' + (error instanceof Error ? error.message : 'Unknown error'),
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
  
  // Add execution summary
  if (result.responses.length > 1) {
    const successCount = result.responses.filter(r => r.status === 'success').length;
    output += `\n*Executed ${result.responses.length} agents in ${result.totalTime}ms. ${successCount} successful.*`;
  }
  
  return output;
}

/**
 * Check if message should use orchestrator (has groupId)
 */
export function shouldUseOrchestrator(groupId?: string): boolean {
  return Boolean(groupId);
}