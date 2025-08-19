import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db/groups';
import { ChatSDKError } from '@/lib/errors';
import { z } from 'zod';
import { aiAgent } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { chatModels } from '@/lib/ai/models';

const allowedModelIds = chatModels.filter((m) => !!m.provider).map((m) => m.id);

const updateAgentSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  role: z.string().max(50).optional(),
  model: z.string().max(50).refine((v) => !v || allowedModelIds.includes(v), 'Invalid model').optional(),
  systemPrompt: z.string().max(2000).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be valid hex color').optional(),
  maxTokens: z.string().max(10).optional(),
  temperature: z.string().max(5).optional(),
  isEnabled: z.boolean().optional(),
});

// PATCH /api/agents/[id] - Update an agent
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new ChatSDKError('unauthorized:api').toResponse();
    }

    const json = await request.json();
    const data = updateAgentSchema.parse(json);

    const [updated] = await db
      .update(aiAgent)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(aiAgent.id, params.id), eq(aiAgent.ownerId, session.user.id)))
      .returning();

    if (!updated) {
      return new ChatSDKError('not_found:api', 'Agent not found').toResponse();
    }

    return Response.json({ agent: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new ChatSDKError('bad_request:api', error.errors[0].message).toResponse();
    }
    console.error('Failed to update agent:', error);
    return new ChatSDKError('bad_request:database', 'Failed to update agent').toResponse();
  }
}

// DELETE /api/agents/[id] - Delete an agent
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new ChatSDKError('unauthorized:api').toResponse();
    }

    const [deleted] = await db
      .delete(aiAgent)
      .where(and(eq(aiAgent.id, params.id), eq(aiAgent.ownerId, session.user.id)))
      .returning();

    if (!deleted) {
      return new ChatSDKError('not_found:api', 'Agent not found').toResponse();
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete agent:', error);
    return new ChatSDKError('bad_request:database', 'Failed to delete agent').toResponse();
  }
}

