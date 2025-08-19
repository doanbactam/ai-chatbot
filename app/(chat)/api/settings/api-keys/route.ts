import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { z } from 'zod';

const ApiKeySchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'google', 'mistral', 'cohere', 'xai']),
  apiKey: z.string().min(1, 'API key is required'),
});

const ApiKeysSchema = z.object({
  apiKeys: z.array(ApiKeySchema),
});

// In-memory storage for demo purposes
// In production, you should use a secure database or encrypted storage
const userApiKeys = new Map<string, Record<string, string>>();

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const apiKeys = userApiKeys.get(userId) || {};
  
  // Return only the provider names and whether they have keys (not the actual keys)
  const maskedKeys = Object.entries(apiKeys).reduce((acc, [provider, key]) => {
    acc[provider] = {
      configured: Boolean(key),
      masked: key ? `${key.slice(0, 8)}...${key.slice(-4)}` : null,
    };
    return acc;
  }, {} as Record<string, { configured: boolean; masked: string | null }>);

  return NextResponse.json({ apiKeys: maskedKeys });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = ApiKeysSchema.parse(body);
    
    const userId = session.user.id;
    const currentKeys = userApiKeys.get(userId) || {};
    
    // Update the API keys
    for (const { provider, apiKey } of validatedData.apiKeys) {
      if (apiKey.trim()) {
        currentKeys[provider] = apiKey.trim();
      } else {
        delete currentKeys[provider];
      }
    }
    
    userApiKeys.set(userId, currentKeys);
    
    return NextResponse.json({ 
      success: true, 
      message: 'API keys updated successfully' 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error updating API keys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');
    
    if (!provider) {
      return NextResponse.json(
        { error: 'Provider parameter is required' },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const currentKeys = userApiKeys.get(userId) || {};
    
    delete currentKeys[provider];
    userApiKeys.set(userId, currentKeys);
    
    return NextResponse.json({ 
      success: true, 
      message: `${provider} API key removed successfully` 
    });
  } catch (error) {
    console.error('Error removing API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
