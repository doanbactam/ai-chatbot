'use client';

import type { User } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PlusIcon } from '@/components/icons';
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
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Settings } from 'lucide-react';

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center"
            >
              <span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
                Chatbot
              </span>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  type="button"
                  className="p-2 h-fit"
                  onClick={() => {
                    setOpenMobile(false);
                    router.push('/');
                    router.refresh();
                  }}
                >
                  <PlusIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end">New Chat</TooltipContent>
            </Tooltip>
          </div>
          <div className="px-2 pt-2">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Tìm kiếm cuộc trò chuyện..."
            />
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory user={user} searchQuery={searchQuery} />
        {user && (
          <div className="p-2 border-t space-y-1">
            <Link
              href="/groups"
              className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-muted rounded-md"
            >
              👥 AI Groups
            </Link>
            <SettingsDialog>
              <button className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-muted rounded-md w-full text-left">
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </SettingsDialog>
          </div>
        )}
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
