import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';
import { AgentsManager } from '@/components/agents-manager';

export default async function AgentsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/api/auth/guest');
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Agents</h1>
            <p className="text-muted-foreground">
              Create and manage your AI agents for personalized conversations.
            </p>
          </div>
          
          <AgentsManager session={session} agents={[]} groups={[]} />
        </div>
      </div>
    </div>
  );
}