'use client';

import { startTransition, useMemo, useOptimistic, useState } from 'react';

import { saveChatModelAsCookie } from '@/app/(chat)/actions';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { chatModels } from '@/lib/ai/models';
import { cn } from '@/lib/utils';

import { CheckCircleFillIcon, ChevronDownIcon } from './icons';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import type { Session } from 'next-auth';

// Provider icons mapping (minimal)
const providerIcons: Record<string, string> = {
	xai: '🤖',
	openai: '⚡',
	anthropic: '🔮',
	google: '🔍',
	mistral: '🌪️',
	cohere: '🎯',
};

export function ModelSelector({
	session,
	selectedModelId,
	className,
}: {
	session: Session;
	selectedModelId: string;
} & React.ComponentProps<typeof Button>) {
	const [open, setOpen] = useState(false);
	const [optimisticModelId, setOptimisticModelId] =
		useOptimistic(selectedModelId);

	const userType = session.user.type;
	const { availableChatModelIds } = entitlementsByUserType[userType];

	const availableChatModels = chatModels.filter((chatModel) =>
		availableChatModelIds.includes(chatModel.id),
	);

	const selectedChatModel = useMemo(
		() =>
			availableChatModels.find(
				(chatModel) => chatModel.id === optimisticModelId,
			),
		[optimisticModelId, availableChatModels],
	);

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger
				asChild
				className={cn(
					'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
					className,
				)}
			>
				<Button
					data-testid="model-selector"
					variant="outline"
					className="md:px-2 md:h-[34px]"
				>
					{selectedChatModel?.name}
					<ChevronDownIcon />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="min-w-[220px] p-1">
				{availableChatModels.map((chatModel) => {
					const { id, provider } = chatModel;

					return (
						<DropdownMenuItem
							data-testid={`model-selector-item-${id}`}
							key={id}
							onSelect={() => {
								setOpen(false);

								startTransition(() => {
									setOptimisticModelId(id);
									saveChatModelAsCookie(id);
								});
							}}
							data-active={id === optimisticModelId}
							asChild
						>
							<button
								type="button"
								className="group/item flex flex-row justify-between items-center w-full gap-3 px-2 py-1.5"
							>
								<div className="flex items-center gap-2">
									<span className="text-sm">{providerIcons[provider] || '🤖'}</span>
									<span className="text-sm font-medium">{chatModel.name}</span>
								</div>
								<div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
									<CheckCircleFillIcon />
								</div>
							</button>
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}