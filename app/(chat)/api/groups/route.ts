import { auth } from '@/app/(auth)/auth';
import { 
  getGroupsByUserId, 
  createGroup, 
} from '@/lib/db/groups';
import { ChatSDKError } from '@/lib/errors';
import { z } from 'zod';

const createGroupSchema = z.object({
  key: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/, 'Key can only contain letters, numbers, underscore and dash'),
  displayName: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

// GET /api/groups - List user's groups
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return new ChatSDKError('unauthorized:api').toResponse();
    }
    
    const groups = await getGroupsByUserId({ userId: session.user.id });
    
    return Response.json({ groups });
  } catch (error) {
    console.error('Failed to get groups:', error);
    return new ChatSDKError('bad_request:database', 'Failed to get groups').toResponse();
  }
}

// POST /api/groups - Create new group
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return new ChatSDKError('unauthorized:api').toResponse();
    }
    
    const json = await request.json();
    const { key, displayName, description } = createGroupSchema.parse(json);
    
    const group = await createGroup({
      ownerId: session.user.id,
      key,
      displayName,
      description,
    });
    
    return Response.json({ group }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new ChatSDKError('bad_request:api', error.errors[0].message).toResponse();
    }
    
    console.error('Failed to create group:', error);
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return new ChatSDKError('bad_request:api', 'Group key already exists').toResponse();
    }
    
    return new ChatSDKError('bad_request:database', 'Failed to create group').toResponse();
  }
}