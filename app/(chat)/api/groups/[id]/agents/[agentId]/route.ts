import { auth } from '@/app/(auth)/auth';
import { removeAgentFromGroup } from '@/lib/db/groups-extended';
import { ChatSDKError } from '@/lib/errors';

// DELETE /api/groups/[id]/agents/[agentId] - Remove agent from group
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; agentId: string }> }
) {
  try {
    const { id, agentId } = await params;
    const session = await auth();
    
    if (!session?.user) {
      return new ChatSDKError('unauthorized:api').toResponse();
    }
    
    await removeAgentFromGroup({
      groupId: id,
      agentId,
      userId: session.user.id,
    });
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Failed to remove agent from group:', error);
    return new ChatSDKError('bad_request:database', 'Failed to remove agent from group').toResponse();
  }
}