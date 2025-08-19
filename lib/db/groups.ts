import 'server-only';

import {
  and,
  desc,
  eq,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import {
  aiGroup,
  aiAgent,
  aiGroupAgent,
  type AiGroup,
  type AiAgent,
} from './schema';
import { ChatSDKError } from '../errors';

// Use the same database connection as the main queries
const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

const client = postgres(connectionString);
export const db = drizzle(client);

// AI Group queries
export async function getGroupsByUserId({
  userId,
}: {
  userId: string;
}): Promise<Array<AiGroup>> {
  try {
    return await db
      .select()
      .from(aiGroup)
      .where(eq(aiGroup.ownerId, userId))
      .orderBy(desc(aiGroup.createdAt));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get groups by user id',
    );
  }
}

export async function getGroupById({
  id,
  userId,
}: {
  id: string;
  userId: string;
}): Promise<AiGroup | null> {
  try {
    const [group] = await db
      .select()
      .from(aiGroup)
      .where(and(eq(aiGroup.id, id), eq(aiGroup.ownerId, userId)));
    
    return group || null;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get group by id',
    );
  }
}

export async function createGroup({
  ownerId,
  key,
  displayName,
  description,
}: {
  ownerId: string;
  key: string;
  displayName: string;
  description?: string;
}): Promise<AiGroup> {
  try {
    const [group] = await db
      .insert(aiGroup)
      .values({
        ownerId,
        key,
        displayName,
        description,
      })
      .returning();

    return group;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create group',
    );
  }
}

export async function createAgent({
  ownerId,
  key,
  displayName,
  role = 'assistant',
  model = 'chat-model',
  systemPrompt,
  color = '#3B82F6',
  maxTokens = '2000',
  temperature = '0.7',
}: {
  ownerId: string;
  key: string;
  displayName: string;
  role?: string;
  model?: string;
  systemPrompt?: string;
  color?: string;
  maxTokens?: string;
  temperature?: string;
}): Promise<AiAgent> {
  try {
    const [agent] = await db
      .insert(aiAgent)
      .values({
        ownerId,
        key,
        displayName,
        role,
        model,
        systemPrompt,
        color,
        maxTokens,
        temperature,
      })
      .returning();

    return agent;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create agent',
    );
  }
}

export async function getActiveAgentsByGroupId({
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
          eq(aiGroup.ownerId, userId),
          eq(aiGroup.isEnabled, true),
          eq(aiAgent.isEnabled, true),
          eq(aiGroupAgent.localEnabled, true)
        )
      )
      .orderBy(aiGroupAgent.addedAt);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get active agents by group id',
    );
  }
}

export async function addAgentToGroup({
  groupId,
  agentId,
  addedBy,
}: {
  groupId: string;
  agentId: string;
  addedBy: string;
}): Promise<void> {
  try {
    await db
      .insert(aiGroupAgent)
      .values({
        groupId,
        agentId,
        addedBy,
      });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to add agent to group',
    );
  }
}