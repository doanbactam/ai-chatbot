import type { Chat } from '@/lib/db/schema';
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from './ui/sidebar';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  CheckCircleFillIcon,
  GlobeIcon,
  LockIcon,
  MoreHorizontalIcon,
  ShareIcon,
  TrashIcon,
} from './icons';
import { memo } from 'react';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { HighlightedText } from './highlighted-text';
import { MessageSquare, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const PureChatItem = ({
  chat,
  isActive,
  onDelete,
  setOpenMobile,
  searchQuery,
}: {
  chat: Chat;
  isActive: boolean;
  onDelete: (chatId: string) => void;
  setOpenMobile: (open: boolean) => void;
  searchQuery?: string;
}) => {
  const { visibilityType, setVisibilityType } = useChatVisibility({
    chatId: chat.id,
    initialVisibilityType: chat.visibility,
  });

  const timeAgo = formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true });

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} className="h-auto p-2">
        <Link href={`/chat/${chat.id}`} onClick={() => setOpenMobile(false)}>
          <div className="flex items-start gap-3 w-full min-w-0">
            <div className="flex-shrink-0 mt-0.5">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <HighlightedText
                  text={chat.title}
                  searchQuery={searchQuery}
                  className="font-medium text-sm truncate"
                />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-3 w-3 text-muted-foreground/70" />
                <span className="text-xs text-muted-foreground/70">
                  {timeAgo}
                </span>
                {chat.visibility === 'public' && (
                  <GlobeIcon size={12} className="text-muted-foreground/70" />
                )}
              </div>
            </div>
          </div>
        </Link>
      </SidebarMenuButton>

      <DropdownMenu modal={true}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5"
            showOnHover={!isActive}
          >
            <MoreHorizontalIcon />
            <span className="sr-only">More</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="bottom" align="end">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <ShareIcon />
              <span>Share</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  className="cursor-pointer flex-row justify-between"
                  onClick={() => {
                    setVisibilityType('private');
                  }}
                >
                  <div className="flex flex-row gap-2 items-center">
                    <LockIcon size={12} />
                    <span>Private</span>
                  </div>
                  {visibilityType === 'private' ? (
                    <CheckCircleFillIcon />
                  ) : null}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer flex-row justify-between"
                  onClick={() => {
                    setVisibilityType('public');
                  }}
                >
                  <div className="flex flex-row gap-2 items-center">
                    <GlobeIcon />
                    <span>Public</span>
                  </div>
                  {visibilityType === 'public' ? <CheckCircleFillIcon /> : null}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
            onSelect={() => onDelete(chat.id)}
          >
            <TrashIcon />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) return false;
  if (prevProps.searchQuery !== nextProps.searchQuery) return false;
  return true;
});
