'use client';

import type { User } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';


import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { SettingsDialog } from '@/components/settings-dialog';
import { SearchInput } from '@/components/search-input';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Settings, MessageSquare, Plus } from 'lucide-react';

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <div className="flex flex-col gap-3">
            {/* Header with title */}
            <div className="flex flex-row justify-between items-center">
              <Link
                href="/"
                onClick={() => {
                  setOpenMobile(false);
                }}
                className="flex flex-row gap-2 items-center"
              >
                <MessageSquare className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">
                  Chatbot
                </span>
              </Link>
            </div>

            {/* New Chat Button - Cursor style */}
            <Button
              type="button"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              onClick={() => {
                setOpenMobile(false);
                router.push('/');
                router.refresh();
              }}
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>

            {/* Search Input */}
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search conversations..."
              className="w-full"
            />
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarHistory user={user} searchQuery={searchQuery} />
      </SidebarContent>
      <SidebarFooter className="p-2 border-t">
        {user && (
          <div className="space-y-1 mb-2">
            <Link
              href="/groups"
              className="flex items-center gap-2 px-2 py-2 text-sm hover:bg-muted rounded-md transition-colors"
            >
              👥 AI Groups
            </Link>
            <SettingsDialog>
              <button className="flex items-center gap-2 px-2 py-2 text-sm hover:bg-muted rounded-md w-full text-left transition-colors">
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </SettingsDialog>
          </div>
        )}
        {user && <SidebarUserNav user={user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
