'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useState, useCallback } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useLocalStorage } from 'usehooks-ts';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher, fetchWithErrorHandlers, generateUUID } from '@/lib/utils';
import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import { StreamingStatus } from './streaming-status';
import type { VisibilityType } from './visibility-selector';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { unstable_serialize } from 'swr/infinite';
import { getChatHistoryPaginationKey } from './sidebar-history';
import { toast } from './toast';
import type { Session } from 'next-auth';
import { useSearchParams } from 'next/navigation';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { useAutoResume } from '@/hooks/use-auto-resume';
import { ChatSDKError } from '@/lib/errors';
import type { Attachment, ChatMessage } from '@/lib/types';
import { useDataStream } from './data-stream-provider';

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  initialGroupId,
  isReadonly,
  session,
  autoResume,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  initialGroupId?: string;
  isReadonly: boolean;
  session: Session;
  autoResume: boolean;
}) {
  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const [selectedGroupId, setSelectedGroupId] = useLocalStorage<string | undefined>(
    `chat-group-${id}`,
    initialGroupId
  );

  const { mutate } = useSWRConfig();
  const { setDataStream } = useDataStream();

  const [input, setInput] = useState<string>('');

  // Enhanced useChat with AI SDK v2 optimizations
  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
    error,
  } = useChat<ChatMessage>({
    id,
    messages: initialMessages,
    // Optimized streaming with better performance
    experimental_throttle: 50, // Reduced from 100ms for smoother streaming
    generateId: generateUUID,
    // Enhanced error handling
    onError: useCallback((error: Error) => {
      console.error('Chat error:', error);
      if (error instanceof ChatSDKError) {
        toast({
          type: 'error',
          description: error.message,
        });
      } else {
        toast({
          type: 'error',
          description: 'An unexpected error occurred. Please try again.',
        });
      }
    }, []),
    // Optimized data streaming
    onData: useCallback((dataPart: any) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
    }, [setDataStream]),
    // Enhanced completion handling
    onFinish: useCallback(() => {
      mutate(unstable_serialize(getChatHistoryPaginationKey));
      setDataStream([]); // Clear data stream after completion
    }, [mutate, setDataStream]),
    // Custom transport with enhanced error handling
    transport: {
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest({ messages, id, body }: { messages: any[], id: string, body: any }) {
        return {
          body: {
            id,
            message: messages.at(-1),
            selectedChatModel: initialChatModel,
            selectedVisibilityType: visibilityType,
            selectedGroupId,
            ...body,
          },
        };
      },
    },
    // Enhanced message handling
    experimental_streamData: true, // Enable streaming data for better UX
    experimental_streamText: true, // Enable streaming text
  });

  // Enhanced query handling with better UX
  const searchParams = useSearchParams();
  const query = searchParams.get('query');
  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery && status !== 'streaming') {
      sendMessage({
        role: 'user' as const,
        parts: [{ type: 'text', text: query }],
      });

      setHasAppendedQuery(true);
      window.history.replaceState({}, '', `/chat/${id}`);
    }
  }, [query, sendMessage, hasAppendedQuery, id, status]);

  // Enhanced voting system with better error handling
  const { data: votes, error: votesError } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher,
    {
      onError: (error) => {
        console.error('Votes fetch error:', error);
        // Don't show toast for votes error as it's not critical
      },
    }
  );

  // Enhanced attachment handling
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  // Enhanced auto-resume with better error handling
  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  // Enhanced error display
  useEffect(() => {
    if (error) {
      console.error('Chat error occurred:', error);
    }
  }, [error]);

  // Enhanced loading states
  const isStreaming = status === 'streaming';
  const isSubmitting = status === 'streaming' || status === 'in_progress';

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={initialChatModel}
          selectedVisibilityType={initialVisibilityType}
          selectedGroupId={selectedGroupId}
          onGroupChange={setSelectedGroupId}
          isReadonly={isReadonly}
          session={session}
        />

        <Messages
          chatId={id}
          status={status}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          regenerate={regenerate}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
          error={error}
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              status={status}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              sendMessage={sendMessage}
              selectedVisibilityType={visibilityType}
              selectedGroupId={selectedGroupId}
              isStreaming={isStreaming}
              isSubmitting={isSubmitting}
            />
          )}
        </form>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        sendMessage={sendMessage}
        messages={messages}
        setMessages={setMessages}
        regenerate={regenerate}
        votes={votes}
        isReadonly={isReadonly}
        selectedVisibilityType={visibilityType}
      />

      {/* Enhanced streaming status indicator */}
      <StreamingStatus 
        isStreaming={isStreaming} 
        isSubmitting={isSubmitting} 
      />
    </>
  );
}
