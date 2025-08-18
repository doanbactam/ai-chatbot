'use client';

import { startTransition, useMemo, useOptimistic, useState } from 'react';
import useSWR from 'swr';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn, fetcher } from '@/lib/utils';
import { CheckCircleFillIcon, ChevronDownIcon } from './icons';
import type { AiGroup } from '@/lib/db/schema';

interface GroupSelectorProps {
  selectedGroupId?: string;
  onGroupChange: (groupId?: string) => void;
  className?: string;
}

export function GroupSelector({
  selectedGroupId,
  onGroupChange,
  className,
}: GroupSelectorProps) {
  const [open, setOpen] = useState(false);
  const [optimisticGroupId, setOptimisticGroupId] = useOptimistic(selectedGroupId);

  const { data, error, isLoading } = useSWR<{ groups: AiGroup[] }>(
    '/api/groups',
    fetcher
  );

  const groups = useMemo(() => data?.groups || [], [data?.groups]);

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === optimisticGroupId),
    [optimisticGroupId, groups]
  );

  const handleGroupSelect = (groupId?: string) => {
    startTransition(() => {
      setOptimisticGroupId(groupId);
      onGroupChange(groupId);
      setOpen(false);
    });
  };

  if (error) {
    return (
      <Button
        variant="outline"
        className={cn('justify-between min-w-[150px]', className)}
        disabled
      >
        <span className="text-red-500">Error loading groups</span>
      </Button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-between min-w-[150px]',
            className
          )}
          disabled={isLoading}
        >
          <div className="flex items-center gap-2">
            <span>👥</span>
            <span className="truncate">
              {isLoading 
                ? 'Loading...' 
                : selectedGroup 
                  ? selectedGroup.displayName
                  : 'No Group'
              }
            </span>
          </div>
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[200px]">
        <DropdownMenuItem
          onClick={() => handleGroupSelect(undefined)}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="size-3" /> {/* Spacer for icon alignment */}
            <span>No Group (Standard Chat)</span>
          </div>
          {!optimisticGroupId && <CheckCircleFillIcon size={16} />}
        </DropdownMenuItem>
        
        {groups.length > 0 && <DropdownMenuSeparator />}
        
        {groups.map((group) => (
          <DropdownMenuItem
            key={group.id}
            onClick={() => handleGroupSelect(group.id)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div 
                className="size-3 rounded-full border"
                style={{ backgroundColor: '#3B82F6' }}
              />
              <div className="flex flex-col">
                <span className="font-medium">{group.displayName}</span>
                {group.description && (
                  <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {group.description}
                  </span>
                )}
              </div>
            </div>
            {optimisticGroupId === group.id && <CheckCircleFillIcon size={16} />}
          </DropdownMenuItem>
        ))}
        
        {groups.length === 0 && !isLoading && (
          <DropdownMenuItem disabled className="text-muted-foreground">
            No groups available
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}