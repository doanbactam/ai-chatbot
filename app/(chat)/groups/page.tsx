import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';
import { GroupsManager } from '@/components/groups-manager';

export default async function GroupsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/api/auth/guest');
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">AI Groups Management</h1>
            <p className="text-muted-foreground">
              Create and manage your AI agent groups for collaborative conversations.
            </p>
          </div>
          
          <GroupsManager session={session} />
        </div>
      </div>
    </div>
  );
}