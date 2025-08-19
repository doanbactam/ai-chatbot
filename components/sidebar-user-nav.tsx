'use client';

import { ChevronUp, Settings, HelpCircle, Users, Lightbulb, LogOut, Bug, Zap } from 'lucide-react';
import Image from 'next/image';
import type { User } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useRouter } from 'next/navigation';
import { toast } from './toast';
import { LoaderIcon } from './icons';
import { guestRegex } from '@/lib/constants';
import { SettingsDialog } from './settings-dialog';

export function SidebarUserNav({ user }: { user: User }) {
  const router = useRouter();
  const { data, status } = useSession();
  const { setTheme, resolvedTheme } = useTheme();

  const isGuest = guestRegex.test(data?.user?.email ?? '');

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {status === 'loading' ? (
              <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10 justify-between">
                <div className="flex flex-row gap-2">
                  <div className="size-6 bg-zinc-500/30 rounded-full animate-pulse" />
                  <span className="bg-zinc-500/30 text-transparent rounded-md animate-pulse">
                    Loading auth status
                  </span>
                </div>
                <div className="animate-spin text-zinc-500">
                  <LoaderIcon />
                </div>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                data-testid="user-nav-button"
                className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10"
              >
                <Image
                  src={`https://avatar.vercel.sh/${user.email}`}
                  alt={user.email ?? 'User Avatar'}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span data-testid="user-email" className="truncate">
                  {isGuest ? 'Guest' : user?.email}
                </span>
                <ChevronUp className="ml-auto" />
              </SidebarMenuButton>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            data-testid="user-nav-menu"
            side="top"
            className="w-[--radix-popper-anchor-width] p-2"
          >
            {/* Cài đặt */}
            <SettingsDialog>
              <DropdownMenuItem
                className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted"
                onSelect={(e) => e.preventDefault()}
              >
                <Settings className="h-4 w-4" />
                Cài đặt
              </DropdownMenuItem>
            </SettingsDialog>

            {/* Báo cáo sự cố */}
            <DropdownMenuItem
              className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted"
              onSelect={() => {
                // TODO: Implement bug report functionality
                toast({
                  type: 'info',
                  description: 'Tính năng báo cáo sự cố sẽ sớm được triển khai!',
                });
              }}
            >
              <Bug className="h-4 w-4" />
              Báo cáo sự cố
            </DropdownMenuItem>

            {/* Cộng đồng */}
            <DropdownMenuItem
              className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted"
              onSelect={() => router.push('/groups')}
            >
              <Users className="h-4 w-4" />
              Cộng đồng
            </DropdownMenuItem>

            {/* FAQ */}
            <DropdownMenuItem
              className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted"
              onSelect={() => {
                // TODO: Implement FAQ functionality
                toast({
                  type: 'info',
                  description: 'Trang FAQ sẽ sớm được triển khai!',
                });
              }}
            >
              <HelpCircle className="h-4 w-4" />
              FAQ
            </DropdownMenuItem>

            {/* Kế hoạch nâng cấp */}
            <DropdownMenuItem
              className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted"
              onSelect={() => {
                // TODO: Implement upgrade plan functionality
                toast({
                  type: 'info',
                  description: 'Tính năng nâng cấp sẽ sớm được triển khai!',
                });
              }}
            >
              <Zap className="h-4 w-4" />
              Kế hoạch nâng cấp
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Đăng xuất */}
            <DropdownMenuItem asChild data-testid="user-nav-item-auth">
              <button
                type="button"
                className="w-full cursor-pointer flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-red-600 hover:text-red-700"
                onClick={() => {
                  if (status === 'loading') {
                    toast({
                      type: 'error',
                      description:
                        'Đang kiểm tra trạng thái xác thực, vui lòng thử lại!',
                    });

                    return;
                  }

                  if (isGuest) {
                    router.push('/login');
                  } else {
                    signOut({
                      redirectTo: '/',
                    });
                  }
                }}
              >
                <LogOut className="h-4 w-4" />
                {isGuest ? 'Đăng nhập' : 'Đăng xuất'}
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
