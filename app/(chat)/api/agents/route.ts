import { auth } from '@/app/(auth)/auth';
import { createAgent, db } from '@/lib/db/groups';
import { ChatSDKError } from '@/lib/errors';
import { z } from 'zod';
import { aiAgent } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { chatModels } from '@/lib/ai/models';

const allowedModelIds = chatModels.filter((m) => !!m.provider).map((m) => m.id);

const createAgentSchema = z.object({
  key: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/, 'Key can only contain letters, numbers, underscore and dash'),
  displayName: z.string().min(1).max(100),
  role: z.string().max(50).optional().default('assistant'),
  model: z.string().max(50).refine((v) => allowedModelIds.includes(v), 'Invalid model').optional().default('chat-model'),
  systemPrompt: z.string().max(2000).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be valid hex color').optional().default('#3B82F6'),
  maxTokens: z.string().max(10).optional().default('2000'),
  temperature: z.string().max(5).optional().default('0.7'),
});

// GET /api/agents - List user's agents
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return new ChatSDKError('unauthorized:api').toResponse();
    }
    
    const agents = await db
      .select()
      .from(aiAgent)
      .where(eq(aiAgent.ownerId, session.user.id))
      .orderBy(aiAgent.createdAt);
    
    return Response.json({ agents });
  } catch (error) {
    console.error('Failed to get agents:', error);
    return new ChatSDKError('bad_request:database', 'Failed to get agents').toResponse();
  }
}

// POST /api/agents - Create new agent
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return new ChatSDKError('unauthorized:api').toResponse();
    }
    
    const json = await request.json();
    const data = createAgentSchema.parse(json);
    
    const agent = await createAgent({
      ownerId: session.user.id,
      ...data,
    });
    
    return Response.json({ agent }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new ChatSDKError('bad_request:api', error.errors[0].message).toResponse();
    }
    
    console.error('Failed to create agent:', error);
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return new ChatSDKError('bad_request:api', 'Agent key already exists').toResponse();
    }
    
    return new ChatSDKError('bad_request:database', 'Failed to create agent').toResponse();
  }
}