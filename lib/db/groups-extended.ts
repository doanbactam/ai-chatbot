import 'server-only';

import {
  and,
  eq,
} from 'drizzle-orm';
import { db } from './groups';
import {
  aiGroup,
  aiAgent,
  aiGroupAgent,
  type AiAgent,
} from './schema';
import { ChatSDKError } from '../errors';

/**
 * Get all agents in a group (both enabled and disabled)
 * Used by API route to show all agents in group management
 */
export async function getAllAgentsByGroupId({
  groupId,
  userId,
}: {
  groupId: string;
  userId: string;
}): Promise<Array<AiAgent & { localEnabled: boolean }>> {
  try {
    return await db
      .select({
        id: aiAgent.id,
        ownerId: aiAgent.ownerId,
        key: aiAgent.key,
        displayName: aiAgent.displayName,
        role: aiAgent.role,
        model: aiAgent.model,
        systemPrompt: aiAgent.systemPrompt,
        color: aiAgent.color,
        isEnabled: aiAgent.isEnabled,
        tools: aiAgent.tools,
        maxTokens: aiAgent.maxTokens,
        temperature: aiAgent.temperature,
        createdAt: aiAgent.createdAt,
        updatedAt: aiAgent.updatedAt,
        localEnabled: aiGroupAgent.localEnabled,
      })
      .from(aiAgent)
      .innerJoin(aiGroupAgent, eq(aiAgent.id, aiGroupAgent.agentId))
      .innerJoin(aiGroup, eq(aiGroupAgent.groupId, aiGroup.id))
      .where(
        and(
          eq(aiGroup.id, groupId),
          eq(aiGroup.ownerId, userId)
        )
      )
      .orderBy(aiGroupAgent.addedAt);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get agents by group id',
    );
  }
}