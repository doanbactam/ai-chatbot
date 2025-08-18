import { auth } from '@/app/(auth)/auth';
import { 
  addAgentToGroup 
} from '@/lib/db/groups';
import { getAllAgentsByGroupId } from '@/lib/db/groups-extended';
import { ChatSDKError } from '@/lib/errors';
import { z } from 'zod';

const addAgentSchema = z.object({
  agentId: z.string().uuid(),
});

// GET /api/groups/[id]/agents - Get agents in group
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user) {
      return new ChatSDKError('unauthorized:api').toResponse();
    }
    
    // This will include all agents (enabled and disabled) with localEnabled status
    const agents = await getAllAgentsByGroupId({ 
      groupId: id, 
      userId: session.user.id 
    });
    
    return Response.json({ agents });
  } catch (error) {
    console.error('Failed to get group agents:', error);
    return new ChatSDKError('bad_request:database', 'Failed to get group agents').toResponse();
  }
}

// POST /api/groups/[id]/agents - Add agent to group
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user) {
      return new ChatSDKError('unauthorized:api').toResponse();
    }
    
    const json = await request.json();
    const { agentId } = addAgentSchema.parse(json);
    
    await addAgentToGroup({
      groupId: id,
      agentId,
      addedBy: session.user.id,
    });
    
    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new ChatSDKError('bad_request:api', error.errors[0].message).toResponse();
    }
    
    console.error('Failed to add agent to group:', error);
    
    // Handle duplicate key error
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return new ChatSDKError('bad_request:api', 'Agent already in group').toResponse();
    }
    
    return new ChatSDKError('bad_request:database', 'Failed to add agent to group').toResponse();
  }
}