import { auth } from '@/app/(auth)/auth';
import { getGroupById } from '@/lib/db/groups';
import { ChatSDKError } from '@/lib/errors';

// GET /api/groups/[id] - Get specific group
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
    
    const group = await getGroupById({ id, userId: session.user.id });
    
    if (!group) {
      return new ChatSDKError('not_found', 'Group not found').toResponse();
    }
    
    return Response.json({ group });
  } catch (error) {
    console.error('Failed to get group:', error);
    return new ChatSDKError('bad_request:database', 'Failed to get group').toResponse();
  }
}